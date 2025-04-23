# test/components/previews/button_component_preview.rb
class Headless::SelectComponentPreview < ViewComponent::Preview
  def basic
    render_with_template(template: "headless/select_component_preview/basic")
  end
end
