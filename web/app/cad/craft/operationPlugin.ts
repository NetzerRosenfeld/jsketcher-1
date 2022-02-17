import React from 'react';
import {state} from 'lstream';
import {IconType} from "react-icons";
import {ActionAppearance} from "../actions/actionSystemPlugin";
import {ApplicationContext, CoreContext} from "context";
import {OperationResult} from "./craftPlugin";
import {OperationSchema, SchemaField, schemaIterator, unwrapMetadata} from "cad/craft/schema/schema";
import {FieldWidgetProps} from "cad/mdf/ui/uiDefinition";
import {Types} from "cad/craft/schema/types";
import {EntityTypeSchema} from "cad/craft/schema/types/entityType";
import {FlattenPath, ParamsPath} from "cad/craft/wizard/wizardTypes";

export function activate(ctx: ApplicationContext) {

  const registry$ = state({});

  ctx.streams.operation = {
    registry:registry$
  };
  
  function addOperation(descriptor: OperationDescriptor<any>, actions) {
    let {id, label, info, icon, actionParams} = descriptor;
    let appearance: ActionAppearance = {
      label,
      info
    };
    if (typeof icon === 'string') {
      appearance.icon32 = icon + '32.png';
      appearance.icon96 = icon + '96.png';
    } else {
      appearance.icon = icon;
    }
    let opAction = {
      id: id,
      appearance,
      invoke: () => ctx.services.wizard.open(id),
      ...actionParams
    };
    actions.push(opAction);

    let schemaIndex = createSchemaIndex(descriptor.schema);
    registry$.mutate(registry => registry[id] = Object.assign({appearance, schemaIndex}, descriptor, {
      run: (request, opContext) => runOperation(request, descriptor, opContext)
    }));
  }

  function registerOperations(operations) {
    let actions = [];
    for (let op of operations) {
      addOperation(op, actions);
    }
    ctx.actionService.registerActions(actions);
  }

  function get<T>(id: string): Operation<T> {
    let op = registry$.value[id];
    if (!op) {
      throw `operation ${id} is not registered`;
    }
    return op;
  }

  let handlers = [];

  function runOperation(request, descriptor, opContext) {
    for (let handler of handlers) {
      let result = handler(descriptor.id, request, opContext);
      if (result) {
        return result;
      }
    }
    return descriptor.run(request, opContext);
  }

  ctx.operationService = {
    registerOperations,
    get,
    handlers
  };

  ctx.services.operation = ctx.operationService;
}

export interface Operation<R> extends OperationDescriptor<R>{
  appearance: {
    id: string;
    label: string;
    info: string;
    icon32: string;
    icon96: string;
    icon: string|IconType;
  };
  schemaIndex: SchemaIndex
}

export interface OperationDescriptor<R> {
  id: string;
  label: string;
  info: string;
  icon: IconType | string | ((props: any) => JSX.Element);
  actionParams?: any;
  run: (request: R, opContext: CoreContext) => OperationResult | Promise<OperationResult>;
  paramsInfo: (params: R) => string,
  previewGeomProvider?: (params: R) => OperationGeometryProvider,
  form: () => React.ReactNode,
  schema: OperationSchema,
  onParamsUpdate?: (params, name, value) => void,
}

export interface OperationService {
  registerOperations(descriptior: OperationDescriptor<any>[]);
  get<T>(operationId: string): Operation<T>;
  handlers: ((
    id: string,
    request: any,
    opContext: CoreContext
  ) => void)[]
}

export type Index<T> = {
  [beanPath: string]: T
};


export interface SchemaIndexField {
  path: ParamsPath,
  flattenedPath: FlattenPath,
  metadata: SchemaField
}

export interface EntityReference {
  field: SchemaIndexField;
  metadata: EntityTypeSchema;
  isArray: boolean;
}

export interface SchemaIndex {
  fields: SchemaIndexField[],
  entities: EntityReference[],
  fieldsByFlattenedPaths: Index<SchemaIndexField>;
  entitiesByFlattenedPaths: Index<EntityReference>;
}

export interface OperationGeometryProvider {

}

function createSchemaIndex(schema: OperationSchema): SchemaIndex {

  const index = {
    fields: [],
    fieldsByFlattenedPaths: {},
  } as SchemaIndex;

  schemaIterator(schema, (path, flattenedPath, metadata) => {
    const indexField = {
      path: [...path],
      flattenedPath,
      metadata
    };
    index.fields.push(indexField);
    index.fieldsByFlattenedPaths[flattenedPath] = indexField;

  });

  index.entities = [];
  index.fields.forEach(f => {

    const unwrappedMd = unwrapMetadata(f.metadata);

    if (unwrappedMd.type !== Types.entity) {
      return;
    }
    const entity: EntityReference= {
      field: f,
      isArray: f.metadata.type === Types.array,
      metadata: unwrappedMd
    };

    index.entities.push(entity);
  });

  return index;
}

declare module 'context' {
  interface CoreContext {

    operationService: OperationService;
  }
}

