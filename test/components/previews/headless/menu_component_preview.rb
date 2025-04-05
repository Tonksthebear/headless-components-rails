# test/components/previews/button_component_preview.rb
class Headless::MenuComponentPreview < ViewComponent::Preview
  def basic
    render_with_template(template: "headless/menu_component_preview/basic")
  end

  def button_style
    render_with_template(template: "headless/menu_component_preview/with_button")
  end

  def menu_placement
    render_with_template(template: "headless/menu_component_preview/menu_placement")
  end

  def with_disabled_items
    render_with_template(template: "headless/menu_component_preview/with_disabled_items")
  end

  def with_sections
    render_with_template(template: "headless/menu_component_preview/with_sections")
  end

  def with_descriptions
    render_with_template(template: "headless/menu_component_preview/with_descriptions")
  end

  def with_sections
    render_with_template(template: "headless/menu_component_preview/with_sections")
  end

  def with_keyboard_shortcuts
    render_with_template(template: "headless/menu_component_preview/with_keyboard_shortcuts")
  end

  def with_header
    render_with_template(template: "headless/menu_component_preview/with_header")
  end

  def with_disabled_button
    render_with_template(template: "headless/menu_component_preview/with_disabled_button")
  end

  def with_icon_trigger
    render_with_template(template: "headless/menu_component_preview/with_icon_trigger")
  end

  def with_avatar_trigger
    render_with_template(template: "headless/menu_component_preview/with_avatar_trigger")
  end

  def with_custom_trigger
    render_with_template(template: "headless/menu_component_preview/with_custom_trigger")
  end

  def with_custom_menu_width
    render_with_template(template: "headless/menu_component_preview/with_custom_menu_width")
  end
end
