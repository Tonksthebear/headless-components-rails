# test/components/previews/button_component_preview.rb
class Headless::DialogComponentPreview < ViewComponent::Preview
  def basic
    render_with_template(template: "headless/dialog_component_preview/basic")
  end

  def with_description
    render_with_template(template: "headless/dialog_component_preview/with_description")
  end
end
