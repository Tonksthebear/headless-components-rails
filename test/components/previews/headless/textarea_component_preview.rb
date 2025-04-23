# test/components/previews/button_component_preview.rb
class Headless::TextareaComponentPreview < ViewComponent::Preview
  def basic
    render_with_template(template: "headless/textarea_component_preview/basic")
  end
end
