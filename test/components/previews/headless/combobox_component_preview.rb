# test/components/previews/button_component_preview.rb
class Headless::ComboboxComponentPreview < ViewComponent::Preview
  def basic
    options = [ { name: "Option 1" }, { name: "Option 2" }, { name: "Option 3" } ]
    render_with_template(template: "headless/combobox_component_preview/basic", locals: { combobox_options: options })
  end
end
