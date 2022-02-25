import {roundValueForPresentation as r} from 'cad/craft/operationHelper';
import {ApplicationContext} from "context";
import {EntityKind} from "cad/model/entities";
import {BooleanDefinition} from "cad/craft/schema/common/BooleanDefinition";
import {OperationDescriptor} from "cad/craft/operationPlugin";
import { param } from 'cypress/types/jquery';
import { MObject } from 'cad/model/mobject';

interface BooleanParams {
  tools: [];
  keepTools:boolean;
  boolean: BooleanDefinition;
}

export const BooleanOperation: OperationDescriptor<BooleanParams> = {
  id: 'BOOLEAN',
  label: 'Boolean',
  icon: 'img/cad/intersection',
  info: 'Booleans 2D sketch',
  paramsInfo: ({tools, boolean}) => `(${r(tools)} ${r(boolean)})`,
  run: (params: BooleanParams, ctx: ApplicationContext) => {
    console.log(params);
    let occ = ctx.occService;
    const oci = occ.commandInterface;

    let returnObject = occ.utils.applyBooleanModifier(params.tools, params.boolean);
    
    if (params.keepTools == true) {
      // filter consumed array to remove the tools but leaving the targets regardless if 
      // the targets are explicitly set or implied by leaving targets blank.
      returnObject.consumed = returnObject.created.filter((el) =>  !params.tools.includes(el as never));
    }else{
      returnObject.consumed = returnObject.consumed.concat(params.tools);
    }

    return returnObject;

  },
  form: [
    {
      type: 'selection',
      name: 'tools',
      capture: [EntityKind.SHELL],
      label: 'Tools',
      optional: false,
      multi: true,
      defaultValue: {
        usePreselection: true,
        preselectionIndex: 0
      },
    },
    {
      type: 'checkbox',
      name: 'keepTools',
      label: 'Keep Tools',
      defaultValue: false,
    },
    {
      type: 'boolean',
      name: 'boolean',
      label: 'Targets',
      optional: true,
      defaultValue: "UNION",
    },
  ],
}
