# test/components/previews/button_component_preview.rb
class Headless::FieldComponentPreview < ViewComponent::Preview
  def basic
    render_with_template(template: "headless/field_component_preview/basic")
  end
end
