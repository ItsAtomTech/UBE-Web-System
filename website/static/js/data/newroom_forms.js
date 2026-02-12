let roomEditor = {
    "forms": [
        {
            "type": "header",
            "value": "New Room",
            "label": "",
            "fancy": true,
            "required": false,
            "description": "",
            "group": "g_02ee0c0e-44fd-4775-bd47-d1f5af2400d4",
            "row_span": null,
            "col_span": null,
            "span_column": false,
            "id": "_0",
            "index": 0
        },
        {
            "type": "text",
            "value": "Untitled Room",
            "label": "Room Name",
            "fancy": true,
            "required": true,
            "description": "",
            "group": "g_02ee0c0e-44fd-4775-bd47-d1f5af2400d4",
            "eventlist": [
                "ev_06717c68-2b62-46ed-a21b-8e0e479909fe"
            ],
            "row_span": 0,
            "col_span": 0,
            "span_column": false,
            "id": "name",
            "onchange": "updatesOn(this)",
            "index": 1
        },
        {
            "type": "checkboxes",
            "value": "[]",
            "config": {
                "config": {
                    "min": "0",
                    "max": "0",
                    "column_view": true,
                    "allow_others": false,
                    "list": "course_list",
                },
                "items": [
                ]
            },
            "label": "Courses",
            "fancy": true,
            "required": false,
            "description": "Select courses available for this room.",
			"list": "course_list",
            "group": "g_02ee0c0e-44fd-4775-bd47-d1f5af2400d4",
            "eventlist": [
                "ev_06717c68-2b62-46ed-a21b-8e0e479909fe"
            ],
            "row_span": null,
            "col_span": null,
            "span_column": false,
            "id": "courses",
            "onchange": "updatesOn(this)",
            "index": 2
        },        
        {
            "type": "textarea",
            "value": "",
            "label": "Description",
            "fancy": false,
            "required": false,
            "description": "",
            "group": "g_02ee0c0e-44fd-4775-bd47-d1f5af2400d4",
            "eventlist": [
                "ev_06717c68-2b62-46ed-a21b-8e0e479909fe"
            ],
            "row_span": 0,
            "col_span": 0,
            "span_column": false,
            "id": "description",
            "onchange": "updatesOn(this)",
            "index": 3
        },        
        {
            "type": "select",
            "value": "",
            "label": "Theme",
            "fancy": true,
            "required": true,
            "description": "",
            "group": "g_02ee0c0e-44fd-4775-bd47-d1f5af2400d4",
            "row_span": null,
            "col_span": null,
            "span_column": false,
            "id": "themes",
            "list": "theme_list",
            "index": 4
        },
    ],
    "groups": [
        {
            "name": "Room Details",
            "type": "default",
            "column_count": 1,
            "row_view": false,
            "id": "g_02ee0c0e-44fd-4775-bd47-d1f5af2400d4"
        }
    ]
}