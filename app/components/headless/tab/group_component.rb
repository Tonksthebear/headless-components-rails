module Headless
  module Tab
    class GroupComponent < ApplicationComponent
      renders_one :tab_list, ->(**list_options) do
        list_options[:selected_index] = @selected_index
        list_options[:id] ||= "#{options[:id]}-tab-list"
        Headless::Tab::ListComponent.new(**list_options)
      end

      renders_many :tabs, ->(**tab_options) do
        tab_options[:selected] = tabs.length == @selected_index
        tab_options[:id] ||= "#{options[:id]}-tab-#{tabs.length}"
        tab_options[:aria] ||= {}
        tab_options[:aria][:controls] = "#{options[:id]}-panel-#{tabs.length}"
        Headless::TabComponent.new(**tab_options)
      end

      renders_one :panels, ->(**panels_options) do
        panels_options[:selected_index] = @selected_index
        panels_options[:id] ||= "#{options[:id]}-panels"
        Headless::Tab::PanelsComponent.new(**panels_options)
      end

      renders_many :tab_panels, ->(**panel_options) do
        panel_options[:selected] = tab_panels.length == @selected_index
        panel_options[:id] ||= "#{options[:id]}-panel-#{tab_panels.length}"
        panel_options[:aria] ||= {}
        panel_options[:aria][:labelledby] = tabs[tab_panels.length - 1].options[:id]
        Headless::Tab::PanelComponent.new(**panel_options)
      end

      def initialize(as: :div, selected_index: 0, vertical: false, manual: false, **options)
        @as = as
        @selected_index = selected_index
        @orientation = vertical ? "vertical" : "horizontal"
        @vertical = vertical
        @manual = manual
        options[:id] ||= "tab-group-#{object_id}"
        super(**options)
      end

      def before_render
        merge_options!({
          role: "tabgroup",
          aria: {
            orientation: @orientation
          },
          data: {
            controller: "headless--tab",
            headless__tab_selected_index_value: @selected_index,
            headless__tab_manual_value: @manual,
            action: actions
          }
        })
      end

      def actions
        stimulus_actions = []

        stimulus_actions << "keydown.home->headless--tab#selectFirstTab:prevent"
        stimulus_actions << "keydown.end->headless--tab#selectLastTab:prevent"
        stimulus_actions << "keydown.page_down->headless--tab#selectLastTab:prevent"
        stimulus_actions << "keydown.page_up->headless--tab#selectFirstTab:prevent"

        if @vertical
          stimulus_actions << "keydown.up->headless--tab#selectPreviousTab:prevent"
          stimulus_actions << "keydown.down->headless--tab#selectNextTab:prevent"
        else
          stimulus_actions << "keydown.left->headless--tab#selectPreviousTab:prevent"
          stimulus_actions << "keydown.right->headless--tab#selectNextTab:prevent"
        end
        stimulus_actions.join(" ")
      end

      def call
        content_tag(@as, content, **options)
      end
    end
  end
end
