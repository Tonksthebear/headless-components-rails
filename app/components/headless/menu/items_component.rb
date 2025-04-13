module Headless
  module Menu
    class ItemsComponent < ApplicationComponent
      jsx_mapping file: "dropdown", component: "DropdownMenu"
      attr_reader :static, :unmount, :anchor_to, :anchor_gap, :anchor_offset, :anchor_padding

      renders_many :items, types: {
        button: -> (text = nil, **arguments) do
          if text.present?
            Headless::Menu::ItemComponent.new(type: :button, **arguments).with_content(text)
          else
            Headless::Menu::ItemComponent.new(type: :button, **arguments)
          end
        end,
        link: -> (*link_arguments, **arguments) do
          if link_arguments.length === 1
            arguments[:href] = link_arguments.first
            Headless::Menu::ItemComponent.new(type: :a, **arguments)
          else
            arguments[:href] = link_arguments.second
            Headless::Menu::ItemComponent.new(type: :a, **arguments).with_content(link_arguments.first)
          end
        end,
        shortcut: -> (**arguments) do
          Headless::MenuComponent::ShortcutComponent.new(**arguments)
        end
      }

      renders_many :sections, Headless::Menu::SectionComponent
      renders_many :separators, Headless::Menu::SeparatorComponent


      def initialize(static: false, unmount: true, anchor_to: nil, anchor_gap: nil, anchor_offset: nil, anchor_padding: nil, **options)
        @static = static
        @unmount = unmount
        @anchor_to = anchor_to
        @anchor_gap = anchor_gap
        @anchor_offset = anchor_offset
        @anchor_padding = anchor_padding
        super(**options)
      end

      def before_render
        merge_classes!(yass(headless: { menu: { items: :classes } }), extra: "!hidden")
        merge_options!({
          id: "portal",
          tabindex: "-1",
          role: "menu",
          data: {
            controller: "headless--portal",
            headless__menu_target: "items",
            headless__transition_target: "child",
            anchor_to: anchor_to,
            anchor_gap: anchor_gap,
            anchor_offset: anchor_offset,
            anchor_padding: anchor_padding,
            hide_after_transition: true,
            action: "
              keydown->headless--menu#focusMatchedItem
              keydown.down->headless--menu#focusNextItem:prevent
              keydown.up->headless--menu#focusPreviousItem:prevent
              keydown.esc@document->headless--transition#leave
              keydown.enter->headless--menu#selectItem
            "
          }
        })
      end

      def call
        tag.div(**options) do
          content
        end
      end
    end
  end
end