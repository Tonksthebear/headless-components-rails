# test/components/previews/button_component_preview.rb
class Headless::RadioGroupComponentPreview < ViewComponent::Preview
  def basic
    plans = [
      { name: "Startup", ram: "12GB", cpus: "6 CPUs", disk: "256GB SSD disk" },
      { name: "Business", ram: "16GB", cpus: "8 CPUs", disk: "512GB SSD disk" },
      { name: "Enterprise", ram: "32GB", cpus: "12 CPUs", disk: "1TB SSD disk" }
    ]
    render_with_template(template: "headless/radio_group_component_preview/basic", locals: { plans: plans })
  end
end
