# test/components/previews/button_component_preview.rb
class Headless::TabGroupComponentPreview < ViewComponent::Preview
  def basic
    render_with_template(template: "headless/tab_group_component_preview/basic")
  end
end
