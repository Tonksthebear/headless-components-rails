# test/components/previews/button_component_preview.rb
class Headless::DisclosureComponentPreview < ViewComponent::Preview
  def basic
    render_with_template(template: "headless/disclosure_component_preview/basic")
  end

  def with_description
    render_with_template(template: "headless/disclosure_component_preview/with_description")
  end
end
