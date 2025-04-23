module Headless
  module Listbox
    class ButtonComponent < Headless::ButtonComponent
      attr_reader :disabled, :auto_focus

      def initialize(keyboard_navigation_actions: [], **options)
        @keyboard_navigation_actions = keyboard_navigation_actions
        super(**options)
      end

      def before_render
        actions = []
        actions << "click->headless--listbox#toggle"

        merge_options!({
          role: "button",
          aria: {
            haspopup: "listbox",
            expanded: "false",
            controls: @options[:listbox_id]
          },
          data: {
            headless__listbox_target: "button",
            action: (actions + @keyboard_navigation_actions).join(" ")
          }
        })
        super
      end
    end
  end
end
