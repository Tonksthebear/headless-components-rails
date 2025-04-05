# test/components/previews/button_component_preview.rb
class Headless::ButtonComponentPreview < ViewComponent::Preview
  def button_colors
    render_with_template(template: "headless/button_component_preview/button_colors")
  end

  def outline_buttons
    render_with_template(template: "headless/button_component_preview/outline_buttons")
  end

  def plain_buttons
    render_with_template(template: "headless/button_component_preview/plain_buttons")
  end

  def solid_buttons
    render_with_template(template: "headless/button_component_preview/solid_buttons")
  end

  def disabled_states
    render_with_template(template: "headless/button_component_preview/disabled_states")
  end

  def with_icon
    render_with_template(template: "headless/button_component_preview/with_icon")
  end

  def using_as_a_link
    render_with_template(template: "headless/button_component_preview/using_as_a_link")
  end
end
