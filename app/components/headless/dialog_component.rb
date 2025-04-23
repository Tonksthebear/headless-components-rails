module Headless
  class DialogComponent < ApplicationComponent
    renders_one :panel, Headless::Dialog::PanelComponent
    renders_one :backdrop, Headless::Dialog::BackdropComponent
    renders_one :title, ->(**title_options) do
      title_options[:id] ||= "#{@id}-title"

      # Set parent dialog labelledby to title id only if a title is provided
      @options[:aria][:labelledby] = title_options[:id]
      Headless::Dialog::TitleComponent.new(**title_options)
    end

    renders_one :description, ->(**description_options) do
      description_options[:id] ||= "#{@id}-description"

      # Set parent dialog describedby to title id only if a title is provided
      @options[:aria][:describedby] = token_list(@options[:aria][:describedby], description_options[:id])
      Headless::DescriptionComponent.new(**description_options)
    end
    renders_many :back_buttons, Headless::Dialog::BackButtonComponent

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
        role: @role,
        aria: {
          modal: true
        },
        data: {
          controller: "headless--portal",
          headless_portal_id: @id,
          headless__dialog_target: "dialog",
          headless__transition_target: "child",
          hide_after_transition: ""
        }
      })

      merge_classes!("!hidden") unless @open
    end

    def container_options
      {
        id: @id,
        class: "contents",
        data: {
          controller: "headless--transition headless--dialog",
          headless__transition_transitioned_value: @open,
          headless__dialog_autofocus_value: @autofocus,
          headless__dialog_headless__portal_outlet: "[data-headless-portal-id='#{@id}']",
          headless__transition_headless__portal_outlet: "[data-headless-portal-id='#{@id}']",
          action: "
            click@document->headless--dialog#documentClicked
            keydown.esc@document->headless--transition#leave
            transition:beforeenter->headless--dialog#sendPortal
            transition:afterenter->headless--dialog#opened
            transition:afterleave->headless--dialog#retrievePortal
            transition:afterleave->headless--dialog#closed
            headless--dialog:enter->headless--transition#enter
            headless--dialog:leave->headless--transition#leave
            keydown.tab@document->headless--dialog#focusNext:prevent
            keydown.shift+tab@document->headless--dialog#focusPrevious:prevent
          "
        }
      }
    end

    def call
      content_tag(:div, container_options) do
        content_tag(@as, content, **@options)
      end
    end
  end
end
