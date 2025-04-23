# test/components/previews/button_component_preview.rb
class Headless::InputComponentPreview < ViewComponent::Preview
  def basic
    render_with_template(template: "headless/input_component_preview/basic")
  end
end
