import {NumberWidget} from "cad/mdf/ui/NumberWidget";
import {SelectionWidget} from "cad/mdf/ui/SelectionWidget";
import {ContainerWidget} from "cad/mdf/ui/ContainerWidget";
import {GroupWidget} from "cad/mdf/ui/GroupWidget";
import {SectionWidget} from "cad/mdf/ui/SectionWidget";
import {VectorWidgetDefinition} from "cad/mdf/ui/VectorWidget";
import {CheckboxWidget} from "cad/mdf/ui/CheckboxWidget";
import {ChoiceWidget} from "cad/mdf/ui/ChoiceWidget";
import {SubFormWidget} from "cad/mdf/ui/SubFormWidget";
import {BooleanWidgetDefinition} from "cad/mdf/ui/BooleanWidget";

export const DynamicComponents = {

  'number': NumberWidget,

  'selection': SelectionWidget,

  'container': ContainerWidget,

  'group': GroupWidget,

  'sub-form': SubFormWidget,

  'section': SectionWidget,

  'checkbox': CheckboxWidget,

  'choice': ChoiceWidget,
}

export const ComponentLibrary = {
  'vector': VectorWidgetDefinition,
  'boolean': BooleanWidgetDefinition
};