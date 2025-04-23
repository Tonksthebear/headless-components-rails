# test/components/previews/button_component_preview.rb
class Headless::ComboboxComponentPreview < ViewComponent::Preview
  def basic
    options = [
      { id: 1, name: "Tom Cook" },
      { id: 2, name: "Wade Cooper" },
      { id: 3, name: "Tanya Fox" },
      { id: 4, name: "Arlene Mccoy" },
      { id: 5, name: "Devon Webb" }
    ]
    render_with_template(template: "headless/combobox_component_preview/basic", locals: { combobox_options: options })
  end
end
