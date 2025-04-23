# test/components/previews/button_component_preview.rb
class Headless::CheckboxComponentPreview < ViewComponent::Preview
  def basic
    render_with_template(template: "headless/checkbox_component_preview/basic")
  end
end
