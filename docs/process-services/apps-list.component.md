---
Added: v2.0.0
Status: Active
Last reviewed: 2018-06-08
---

# Apps List Component

Shows all available apps.

![how-filter-apps](../docassets/images/how-filter-apps.png)

## Basic Usage

```html
<adf-apps 
    [layoutType]="'GRID'">
</adf-apps>
```

You can also show a custom template if there are no apps present:

```html
<adf-apps
    [layoutType]="'GRID'">
        <adf-empty-custom-content>
            No Apps present
        </adf-empty-custom-content>
</adf-apps>
```

## Class members

### Properties

| Name | Type | Default value | Description |
| ---- | ---- | ------------- | ----------- |
| filtersAppId | `any[]` |  | Provides a way to filter the apps to show. |
| layoutType | `string` |  | (**required**) Defines the layout of the apps. There are two possible values, "GRID" and "LIST". |

### Events

| Name | Type | Description |
| ---- | ---- | ----------- |
| appClick | [`EventEmitter`](https://angular.io/api/core/EventEmitter)`<`[`AppDefinitionRepresentationModel`](../../lib/process-services/task-list/models/filter.model.ts)`>` | Emitted when an app entry is clicked. |
| error | [`EventEmitter`](https://angular.io/api/core/EventEmitter)`<any>` | Emitted when an error occurs. |

## Details

You can specify a restricted list of apps using the `filtersAppId` property. This array
contains a list of objects containing the property values you are interested in. You can
use any of the following properties as filters:

```json
{ 
    "defaultAppId": "string", 
    "deploymentId": "string", 
    "name": "string", 
    "id": "number", 
    "modelId": "number",
    "tenantId": "number"
}
```

For example, if you set `filtersAppId` as follows:

```html
<adf-apps 
    [filtersAppId]="'[
        {defaultAppId: 'tasks'}, 
        {deploymentId: '15037'}, 
        {name : 'my app name'}]'">
</adf-apps>
```

...then only the Tasks app, the app with `deploymentId` 15037 and the app with "my app name" will be shown.

![how-filter-apps](../docassets/images/how-filter-apps.png)
