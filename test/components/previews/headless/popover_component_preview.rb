# test/components/previews/button_component_preview.rb
class Headless::PopoverComponentPreview < ViewComponent::Preview
  def basic
    render_with_template(template: "headless/popover_component_preview/basic")
  end

  def group
    render_with_template(template: "headless/popover_component_preview/group")
  end
end
