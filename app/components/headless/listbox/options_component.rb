module Headless
  module Listbox
    class OptionsComponent < ApplicationComponent
      attr_reader :options_id

      def initialize(as: :div, listbox_id: nil, horizontal: false, keyboard_navigation_actions: [], **options)
        @as = as
        @listbox_id = listbox_id
        @horizontal = horizontal
        @keyboard_navigation_actions = keyboard_navigation_actions
        super(**options)
      end

      def before_render
        actions = []
        actions << "click@document->headless--listbox#closeOnClickOutside"
        actions << "transition:beforeenter->headless--listbox#sendPortal"
        actions << "transition:afterenter->headless--listbox#listboxOpened"
        actions << "transition:afterleave->headless--listbox#listboxClosed"
        actions << "headless--listbox:leave->headless--transition#leave"
        actions << "transition:afterleave->headless--listbox#retrievePortal"
        actions << "keydown->headless--listbox#focusMatchedItem:prevent"
        actions << "keydown.enter->headless--listbox#selectActiveOption:prevent"
        actions << "keydown.space->headless--listbox#selectActiveOption:prevent"
        actions << "keydown.home->headless--listbox#focusFirstOption:prevent"
        actions << "keydown.page_up->headless--listbox#focusFirstOption:prevent"
        actions << "keydown.end->headless--listbox#focusLastOption:prevent"
        actions << "keydown.page_down->headless--listbox#focusLastOption:prevent"
        actions << "keydown.esc->headless--listbox#close:prevent"

        merge_options!({
          id: @options_id,
          role: "listbox",
          tabindex: "-1",
          aria: {
            orientation: @horizontal ? "horizontal" : "vertical",
            multiselectable: @mutliselect
          },
          data: {
            controller: "headless--portal",
            headless__listbox_target: "options",
            headless_portal_id: "#{@listbox_id}-portal",
            headless__transition_target: "child",
            hide_after_transition: "",
            action: (actions + @keyboard_navigation_actions).join(" ")
          }
        })

        merge_classes!("!hidden") if !@open
      end

      def call
        content_tag(@as, content, **@options)
      end
    end
  end
end
