const forms = require('forms');

// create some shortcuts
const fields = forms.fields;
const widgets = forms.widgets;
const validators = forms.validators;

var bootstrapField = function (name, object) {
    if (!Array.isArray(object.widget.classes)) { object.widget.classes = []; }

    if (object.widget.classes.indexOf('form-control') === -1) {
        object.widget.classes.push('form-control');
    }

    var validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid' : validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }

    var label = object.labelHTML(name);
    var error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>' : '';

    var widget = object.widget.toHTML(name, object);
    return '<div class="form-group">' + label + widget + error + '</div>';
};

// pass in an array of categories
// the categories must be an array of array
// each inner array has two elements - first: key, second: value
const createProductForm = (categories=[], tags=[]) => {
    // creates a form object
    // the key will the value of the `name` attribute
    return forms.create({
        'name': fields.string({
            required: true,
            errorAfterField: true,
        }),
        'cost':fields.number({
            required: true,
            errorAfterField: true,
            validators:[validators.min(1), validators.integer()]
        }),
        'description':fields.string({
            required: true,
            errorAfterField: true
        }),
        'category_id': fields.string({
            label: 'Category',
            required: true,
            errorAfterField: true,
            widget: widgets.select(),
            choices:categories
        }),
        'tags': fields.string({
            label:'Tags',
            required: false,
            errorAfterField: true,
            widget: widgets.multipleSelect(),
            choices: tags
        }),
        'image_url': fields.string({
            widget: widgets.hidden()
        })
    })
}

const createUserForm = () => {
    return forms.create({
        'name': fields.string({
            required: true,
            errorAfterField: true
        }),
        'email': fields.string({
            required: true,
            errorAfterField: true
        }),
        'password': fields.password({
            required: true,
            errorAfterField: true
        }),
        'confirm_password': fields.password({
            label:"Password Again",
            errorAfterField: true,
            validators:[validators.matchField("password")]
        }),
    })
}

const createLoginForm = () => {
    return forms.create({
        'email': fields.string({
            required: true,
            errorAfterField: true
        }),
        'password': fields.password({
            required: true,
            errorAfterField: true
        })
    })
}

module.exports = {
    bootstrapField,
    createProductForm,
    createUserForm,
    createLoginForm
}