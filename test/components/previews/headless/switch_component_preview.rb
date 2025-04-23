# test/components/previews/button_component_preview.rb
class Headless::SwitchComponentPreview < ViewComponent::Preview
  def basic
    render_with_template(template: "headless/switch_component_preview/basic")
  end
end
