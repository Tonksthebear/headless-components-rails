# frozen_string_literal: true

module Headless
  class SwitchComponent < ApplicationComponent
    jsx_mapping file: "switch", component: "Switch"

    erb_template <<~ERB
      <%= tag.span(**@options) do %>
        <%= checkbox_tag @options[:name], checked: @options[:checked], class: "sr-only", **checkbox_options %>
        <%= content %>
      <% end %>
    ERB

    def initialize(default_checked: false, value: nil, **options)
      options[:checked] ||= default_checked
      options[:value] ||= value
      options[:name] ||= "switch-#{object_id}"
      super(**options)
    end

    def checkbox_options
      {
        onchange: "Headless.checkboxChanged(this)",
        name: @options[:name] || nil,
        disabled: @options[:disabled] || nil,
        value: @options[:value] || nil
      }
    end

    def before_render
      merge_options!({
        tabindex: 0,
        role: "switch",
        onkeydown: "Headless.checkboxKeydown(event, this)",
        onfocus: "Headless.elementFocus(this)",
        onblur: "Headless.elementBlur(this)",
        onmouseenter: "Headless.elementHover(this)",
        onmouseleave: "Headless.elementLeave(this)",
        onmousedown: "Headless.elementMouseDown(this)",
        onmouseup: "Headless.elementMouseUp(this)",
        onclick: "Headless.checkboxClicked(event, this)",
        aria: {
          checked: @options[:checked] || nil,
          disabled: @options[:disabled] || nil
        },
        data: {
          disabled: @options[:disabled] || nil,
          checked: @options[:checked] ? "" : nil
        }
      })
    end
  end
end
