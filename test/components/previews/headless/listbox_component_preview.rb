# test/components/previews/button_component_preview.rb
class Headless::ListboxComponentPreview < ViewComponent::Preview
  def basic
    options = [
      { id: 1, name: "Tom Cook" },
      { id: 2, name: "Wade Cooper" },
      { id: 3, name: "Tanya Fox" },
      { id: 4, name: "Arlene Mccoy" },
      { id: 5, name: "Devon Webb" }
    ]
    render_with_template(template: "headless/listbox_component_preview/basic", locals: { listbox_options: options })
  end
end
