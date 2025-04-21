module Headless
  module Combobox
    class InputComponent < ApplicationComponent
      erb_template <<~ERB
        <%= hidden_field_tag @name, nil, data: { headless__combobox_target: "hiddenInput" } %>
        <%= content_tag(@as, content, **@options) %>
      ERB

      def initialize(as: :input, name: "headless_combobox_value", **options)
        @as = as
        @name = name
        super(**options)
      end

      def before_render
        merge_options!({
          role: "combobox",
          aria: {
            autocomplete: "list",
            expanded: "false"
          },
          data: {
            headless__combobox_target: "input",
            action: "
              input->headless--combobox#updateQuery
              focus->headless--combobox#inputFocused
            "
          }
        })
      end
    end
  end
end
