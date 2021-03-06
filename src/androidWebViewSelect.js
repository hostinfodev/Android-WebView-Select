// Add the core styling to DOM
const andSelCoreCSS = `
/* ANDROID-SELECT CORE STYLING */

.__android_selector___wrapper{
    width:      125px;
    height:     25px;
}

.__android_selector___wrapper:hover{
    cursor:     pointer;
}

.__android_selector___options{
    height:     100%;
    z-index:    100;
    position: relative
}

.__android_selector___option{
    border:     1px solid rgb(130, 130, 130);
    text-align: center;
    z-index:    100;
    background-color: white;
}

.__android_selector___option_highlight:hover{
    background-color: #3297fd;
}

.__android_selector___option_disabled:hover{
    cursor: not-allowed;
}
`;

$("head").prepend(`<style>\n${andSelCoreCSS}\n</style>`);

// AndroidSelect Class Instance
class AndroidSelect {
    constructor(jQueryElementSelector, selectOptions, style = {
        wrapper: [],
        options: [],
        option: []
    }, onSelect = (value) => {
        /*alert(value)*/
    }) {

        if (!window.jQuery) {
            alert("Android-WebView-Select requires jQuery!")
            return;
        }

        // jQueryElementSelector -> STRING
        // selectOptions         -> OBJECT
        // style                 -> OBJECT
        // onSelect              -> VOID or FUNCTION; parameter -> STRING: value

        // Our arrow
        const arrowChar = ' <code>&#709;</code>';

        // Make a unique id for this select instance, allowing easy management in a multi-instance DOM.
        this.id = Math.random().toString().replace("0.", "")

        // Define our anchor, this is essentially what we will be appending our selector to
        this.anchor = $(jQueryElementSelector)

        // Process the provided options
        let options = []
        let optBuffer = ""
        for (let option of selectOptions) {
            let auxillaryClasses = "";
            let id = Math.random().toString().replace("0.", "")
            let disabled = "";
            let isDisabled = false;
            if ('disabled' in option) {
                if (option.disabled) {
                    disabled = "disabled disabled=\"disabled\"";
                    auxillaryClasses += " __android_selector___option_disabled";
                    isDisabled = true;
                }
            }
            optBuffer += `<div class="__android_selector___option __android_selector___option_highlight ${style.option.join(' ')}${auxillaryClasses}" android_select_parent_node="${this.id}" id="__android_select_option_${id}" android_select_value="${option.value}" ${disabled}>${option.name}</div>\n`

            console.log(optBuffer)

            options.push({
                name: option.name,
                value: option.value,
                disabled: isDisabled,
                id: id
            })
        }

        // Add options to the instance, making them publicly accessible
        this.options = options

        // Add empty class arrays to avoid key error
        if (!'wrapper' in style) {
            style.wrapper = []
        }
        if (!'option' in style) {
            style.option = []
        }
        if (!'options' in style) {
            style.options = []
        }

        // Create HTML for our select 
        this.html = `
        <div class="__android_selector___wrapper ${style.wrapper.join(' ')}" id="android_select_wrapper_${this.id}">
            <div class="__android_selector___option ${style.option.join(' ')}" android_select_parent_node="${this.id}" id="android_select_selected_${this.id}" android_select_value="${this.options[0].value}">${this.options[0].name}${arrowChar}</div>
            <div class="__android_selector___options ${style.options.join(' ')}" android_select_parent_node="${this.id}" id="android_select_options_${this.id}" hidden>
                ${optBuffer}
            </div>
        </div>
        `;

        // Append HTML to the anchor
        this.anchor.append(this.html)

        // Define a DOM element for easy manipulation of the entire select
        this.wrapper_domElement = $(`#android_select_wrapper_${this.id}`)

        // Define a DOM element for easy manipulation of the dropdown
        this.options_domElement = $(`#android_select_options_${this.id}`)

        // Add a listener that will show our options when the box is clicked/tapped
        $(`#android_select_selected_${this.id}`).on('click', (e) => {
            $(`#android_select_options_${this.id}`).show()
        })

        // Initialize a global that handles the state of the select
        if (window.androidSelectInstances === undefined) {
            window.androidSelectInstances = {}
        }

        // Adds this select instance the androidSelectInstances global
        window.androidSelectInstances[this.id] = {
            options: this.options,
            selected: {
                name: this.options[0].name,
                value: this.options[0].value
            }
        }

        // Initialize the value; this is public and can be used to access the current selected value
        this.value = this.options[0].value;

        // GLOBAL AND WILL (SHOULD) ONLY HAPPEN ONCE
        if (window.androidBodyClickListener === undefined) {
            // Listens for click/tap OUTSIDE of ANY select instance
            $(document).on('click', (e) => {
                // Check if ANY select instace is the target
                if (!e.target.id.includes("android_select_")) {
                    // Hide all select options if so
                    $('.__android_selector___options').hide()
                } else {
                    // If the click/tap target was in fact an android select element the process the click/tap
                    if (e.target.id.includes("android_select_option_") && !($('#' + e.target.id).attr('disabled') == "disabled")) {
                        // If target was an option:
                        // Get values from the target option's attributes
                        let value = $(e.target).attr("android_select_value");
                        let name = $(e.target).html();
                        let parentID = $(e.target).attr("android_select_parent_node");

                        // Overwrite current value for this select @ global "androidSelectInstances"
                        let nodeBuffer = window.androidSelectInstances[parentID];
                        nodeBuffer.selected = {
                            name: name,
                            value: value
                        }
                        window.androidSelectInstances[parentID] = nodeBuffer;

                        // Assign the value
                        this.value = value;

                        // Update the select
                        $(`#android_select_selected_${parentID}`).attr("android_select_value", value)
                        $(`#android_select_selected_${parentID}`).html(name + arrowChar)
                        $('.__android_selector___options').hide()

                        // call the utility onSelect Function
                        onSelect(value);
                    }
                }
            });
            // Let other instances know that this has already been initialized
            window.androidBodyClickListener = true;
        }
    }
}