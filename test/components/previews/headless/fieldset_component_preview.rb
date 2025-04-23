# test/components/previews/button_component_preview.rb
class Headless::FieldsetComponentPreview < ViewComponent::Preview
  def basic
    render_with_template(template: "headless/fieldset_component_preview/basic")
  end
end
