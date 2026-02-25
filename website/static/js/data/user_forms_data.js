let configForm = {
    "forms": [
        {
            "type": "header",
            "events": {},
            "value": "New User",
            "label": "",
            "fancy": true,
            "required": false,
            "description": "",
            "group": "g_280bbbd8-6fda-41b7-8377-636eb6328b6a",
            "row_span": null,
            "col_span": null,
            "span_column": false,
            
            "id": "_0",
            "index": 0
        },
        {
            "type": "text",
            "events": {},
            "value": "",
            "label": "Username",
            "fancy": true,
            "required": true,
            "description": "",
            "group": "g_280bbbd8-6fda-41b7-8377-636eb6328b6a",
            "row_span": null,
            "col_span": null,
            "span_column": false,
            "id": "username",
            "onchange":"updatesOn(this)",
            "index": 1
        },
        {
            "type": "text",
            "events": {},
            "value": "",
            "label": "Email",
            "fancy": true,
            "required": true,
            "description": "",
            "group": "g_280bbbd8-6fda-41b7-8377-636eb6328b6a",
            "row_span": null,
            "col_span": null,
            "span_column": false,
            "id": "email",
            "onchange":"updatesOn(this)",
            "index": 2
        },
        {
            "type": "select",
            "events": {},
            "value": "",
            "label": "User Type",
            "fancy": true,
            "required": false,
            "description": "",
            "group": "g_280bbbd8-6fda-41b7-8377-636eb6328b6a",
            "row_span": null,
            "col_span": null,
            "span_column": false,
            "list": "usertype",
            "id": "type",
            "onchange":"updatesOn(this)",
            "index": 3
        },
        {
            "type": "password",
            "events": {},
            "value": "",
            "label": "Password",
            "fancy": true,
            "required": true,
            "description": "",
            "group": "g_280bbbd8-6fda-41b7-8377-636eb6328b6a",
            "row_span": null,
            "col_span": null,
            "span_column": false,
            "onchange":"updatesOn(this)",
            "id": "password",
            "index": 4
        },
        {
            "type": "password",
            "events": {},
            "value": "",
            "label": "Re-Enter Password",
            "fancy": true,
            "required": true,
            "description": "",
            "group": "g_280bbbd8-6fda-41b7-8377-636eb6328b6a",
            "row_span": null,
            "col_span": null,
            "onchange":"updatesOn(this)",
            "span_column": false,
            "id": "repassword",
            "index": 5
        }
    ],
    "groups": [
        {
            "name": "User Detials",
            "type": "default",
            "column_count": 1,
            "row_view": true,
            "id": "g_280bbbd8-6fda-41b7-8377-636eb6328b6a"
        }
    ]
}