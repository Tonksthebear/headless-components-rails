# test/components/previews/button_component_preview.rb
class Headless::MenuComponentPreview < ViewComponent::Preview
  def standard
    render_with_template(template: "headless/menu_component_preview/standard")
  end
end
