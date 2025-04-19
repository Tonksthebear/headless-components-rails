module Headless
  class TabComponent < ButtonComponent
    def initialize(as: :button, selected: false, **options)
      @as = as
      @selected = selected
      @id = options[:id]
      super(**options)
    end

    def before_render
      merge_options!({
        tabindex: "-1",
        aria: {
          selected: "false"
        },
        data: {
          selected: @selected || nil,
          role: "tab",
          headless__tab_target: "tab",
          action: "click->headless--tab#selectTab"
        }
      })
      super
    end

    def call
      content_tag(@as, content, **@options)
    end
  end
end
