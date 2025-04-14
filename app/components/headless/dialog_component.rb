module Headless
  class DialogComponent < ApplicationComponent
    renders_one :panel, Headless::Dialog::PanelComponent
    renders_one :backdrop, Headless::Dialog::BackdropComponent
    renders_one :title, Headless::Dialog::TitleComponent
    renders_one :description, Headless::DescriptionComponent

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
        id: options[:id],
        role: @role,
        aria: {
          modal: true
        },
        data: {
          controller: "headless--portal",
          headless_portal_id: @id,
          headless__dialog_target: "dialog",
          headless__transition_target: "child",
          hide_after_transition: true
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
        content_tag(as, content, **options)
      end
    end
  end
end
