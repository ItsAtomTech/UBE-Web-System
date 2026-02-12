let lessonForm = {
    "forms": [
        {
            "type": "header",
            "value": "Lesson Editor",
            "label": "",
            "fancy": true,
            "required": false,
            "description": "",
            "group": "g_686f61b9-a720-4b15-a223-ff85323a08fb",
            "row_span": null,
            "col_span": null,
            "span_column": true,
            "id": "_0",
            "index": 0
        },
        {
            "type": "text",
            "value": "",
            "label": "Lesson Title",
            "fancy": true,
            "required": true,
            "description": "",
            "group": "g_686f61b9-a720-4b15-a223-ff85323a08fb",
            "row_span": null,
            "col_span": null,
            "span_column": false,
            "id": "name",
            "index": 1
        },
        {
            "type": "select",
            "value": "",
            "label": "Lesson Category",
            "fancy": true,
            "required": true,
            "description": "",
            "group": "g_686f61b9-a720-4b15-a223-ff85323a08fb",
            "row_span": null,
            "col_span": null,
            "span_column": false,
            "list":'category_list',
            "id": "category",
            "index": 2
        },        
        {
            "type": "number",
            "value": "",
            "label": "Semester",
            "fancy": true,
            "min": 1,
            "max": 4,
            "required": true,
            "description": "",
            "group": "g_686f61b9-a720-4b15-a223-ff85323a08fb",
            "row_span": null,
            "col_span": null,
            "span_column": false,
            "list":'quarter_list',
            "id": "quarter",
            "index": 2
        },
        {
            "type": "textarea",
            "events": {},
            "value": "Lesson Goes Here",
            "label": "Lesson Content",
            "fancy": false,
            "required": true,
            "description": "",
            "group": "g_686f61b9-a720-4b15-a223-ff85323a08fb",
            "row_span": 0,
            "col_span": 0,
            "span_column": true,
            "id": "lesson_text",
            "index": 3
        }
    ],
    "groups": [
        {
            "name": "Group 1",
            "type": "default",
            "column_count": "2",
            "row_view": false,
            "id": "g_686f61b9-a720-4b15-a223-ff85323a08fb"
        }
    ]
}