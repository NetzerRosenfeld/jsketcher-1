import { roundValueForPresentation as r } from 'cad/craft/operationHelper';
import { MFace } from "cad/model/mface";
import { ApplicationContext } from "context";
import { EntityKind } from "cad/model/entities";
import Axis from "math/axis";
import { OperationDescriptor } from "cad/craft/operationPlugin";
import { MShell } from 'cad/model/mshell';

interface MirrorBodyParams {
  inputBodies: MShell[];
  face:MFace;
}

export const MirrorBodyOperation: OperationDescriptor<MirrorBodyParams> = {
  id: 'MIRROR_BODY',
  label: 'Mirror Body',
  icon: 'img/cad/MirrorBody',
  info: 'Mirrors selected body along plane of symytry.',
  paramsInfo: ({  }) => `(${r()})`,
  run: (params: MirrorBodyParams, ctx: ApplicationContext) => {
    console.log(params);
    let occ = ctx.occService;
    const oci = occ.commandInterface;

    let created =[];

    params.inputBodies.forEach((shellToMirror) => {
      const newShellName = shellToMirror.id + ":mirror";
      oci.copy(shellToMirror, newShellName);
      params.face.csys.origin.data();
      oci.tmirror(newShellName, ...params.face.csys.origin.data(), ...params.face.csys.origin.normalize().data());
      created.push(occ.io.getShell(newShellName));
    });

    return {
      created,
      consumed: []
    };


  },
  form: [
    {
      type: 'selection',
      name: 'face',
      capture: [EntityKind.FACE],
      label: 'Mirror Plane',
      multi: false,
      defaultValue: {
        usePreselection: false,
        preselectionIndex: 0
      },
    },
    {
      type: 'selection',
      name: 'inputBodies',
      capture: [EntityKind.SHELL],
      label: 'Bodies',
      multi: true,
      defaultValue: {
        usePreselection: true,
        preselectionIndex: 0
      },
    },
  ],
}
