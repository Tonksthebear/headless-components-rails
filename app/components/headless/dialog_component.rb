module Headless
  class DialogComponent < ApplicationComponent
    renders_many :buttons, ->(**button_options, &block) do
      button_options[:data] ||= {}
      button_options[:data][:dialog] = @id
      Headless::ButtonComponent.new(**button_options)
    end

    renders_one :panel, ->(**panel_options) do
      Headless::Dialog::PanelComponent.new(**panel_options)
    end

    renders_one :backdrop, ->(**backdrop_options) do
      Headless::Dialog::BackdropComponent.new(**backdrop_options)
    end

    renders_one :title, ->(**title_options, &block) do
      title_options[:id] ||= "#{@id}-title"

      @options[:aria][:labelledby] = title_options[:id]
      Headless::Dialog::TitleComponent.new(**title_options, &block)
    end

    renders_one :description, ->(**description_options, &block) do
      description_options[:id] ||= "#{@id}-description"

      @options[:aria][:describedby] = token_list(@options[:aria][:describedby], description_options[:id])
      Headless::DescriptionComponent.new(**description_options, &block)
    end

    renders_many :back_buttons, ->(**back_button_options, &block) do
      Headless::Dialog::BackButtonComponent.new(**back_button_options, &block)
    end

    def initialize(id: "dialog-#{object_id}", open: false, as: :div, role: :dialog, autofocus: false, **options)
      @id = id
      @open = open
      @as = as
      @role = role
      @autofocus = autofocus if autofocus
      options[:autofocus] = autofocus
      super(**options)
    end

    def before_render
      merge_options!({
        id: @options[:id],
        tabindex: "-1",
        role: @role,
        aria: {
          modal: true
        },
        data: {
          controller: "headless--portal",
          portal_id: @id,
          headless__dialog_target: "dialog",
          headless__transition_target: "child",
          hide_after_transition: ""
        }
      })

      merge_classes!("!hidden")
    end

    def container_options
      {
        id: @id,
        class: "contents",
        data: {
          controller: "headless--transition headless--dialog",
          headless__dialog_start_open_value: @open,
          headless__dialog_autofocus_value: @autofocus,
          headless__dialog_headless__portal_outlet: "[data-portal-id='#{@id}']",
          headless__dialog_headless__transition_outlet: "##{@id}",
          headless__transition_headless__portal_outlet: "[data-portal-id='#{@id}']",
          action: "
            click@document->headless--dialog#documentClicked
            keydown.esc@document->headless--dialog#close
            keydown.tab@document->headless--dialog#focusNext:prevent
            keydown.shift+tab@document->headless--dialog#focusPrevious:prevent
          "
        }
      }
    end

    def call
      button_html = if buttons?
        buttons.join(" ").html_safe
      else
        "".html_safe
      end
      button_html +
      content_tag(:div, container_options) do
        content_tag(@as, content, **@options)
      end
    end
  end
end
