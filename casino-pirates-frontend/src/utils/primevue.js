export default {
  dialog: {
    root: () => ({
      class: [
        "w-[calc(100%-24px)] md:min-w-[480px] md:w-fit",
        "rounded-lg",
        "dialog-shadow",
        "border",
        "border-mine-shaft-950",
        "max-h-[90vh]",
        "max-w-[calc(100%-24px)]",
        "transform",
        "scale-100",
        "bg-woodsmoke-960",
      ],
    }),
    header: {
      class: [
        "dialog-header [&.dialog-header:has(span)]:border-b [&.dialog-header:has(span)]:border-mine-shaft-950",
        "flex items-center justify-end",
        "px-4 py-5 xl:px-8 xl:py-6",
        "rounded-tl-lg",
        "rounded-tr-lg",
        "text-gallery-100",
      ],
    },
    title: {
      class: ["font-bold text-lg text-center flex-1"],
    },
    icons: {
      class: ["flex items-center"],
    },
    closeButton: {
      class: [
        "relative",
        "flex items-center justify-center",
        "w-5 h-5",
        "text-boulder-500",
        "transition duration-200 ease-in-out",
        "hover:text-boulder-300",
        "hover:bg-surface-100 dark:hover:bg-surface-800/80",
        "overflow-hidden",
      ],
    },
    icon: {},
    closeButtonIcon: {
      class: ["inline-block", "w-5", "h-5"],
    },
    content: () => ({
      class: ["p-4 xl:py-4 xl:px-8", "overflow-y-auto"],
    }),
    footer: {
      class: [
        "dialog-footer flex items-center gap-2 xl:gap-3",
        "p-4 xl:px-4",
        "border-t border-mine-shaft-950",
        "rounded-bl-lg",
        "rounded-br-lg",
      ],
    },
    mask: ({ props: e }) => ({
      class: ["transition", "duration-200", { "dialog-wrapper": e.modal }],
    }),
    transition: ({ props: e }) =>
      e.position === "top"
        ? {
            enterFromClass:
              "opacity-0 scale-75 translate-x-0 -translate-y-full translate-z-0",
            enterActiveClass: "transition-all duration-200 ease-out",
            leaveActiveClass: "transition-all duration-200 ease-out",
            leaveToClass:
              "opacity-0 scale-75 translate-x-0 -translate-y-full translate-z-0",
          }
        : e.position === "bottom"
        ? {
            enterFromClass: "opacity-0 scale-75 translate-y-full",
            enterActiveClass: "transition-all duration-200 ease-out",
            leaveActiveClass: "transition-all duration-200 ease-out",
            leaveToClass:
              "opacity-0 scale-75 translate-x-0 translate-y-full translate-z-0",
          }
        : e.position === "left" ||
          e.position === "topleft" ||
          e.position === "bottomleft"
        ? {
            enterFromClass:
              "opacity-0 scale-75 -translate-x-full translate-y-0 translate-z-0",
            enterActiveClass: "transition-all duration-200 ease-out",
            leaveActiveClass: "transition-all duration-200 ease-out",
            leaveToClass:
              "opacity-0 scale-75  -translate-x-full translate-y-0 translate-z-0",
          }
        : e.position === "right" ||
          e.position === "topright" ||
          e.position === "bottomright"
        ? {
            enterFromClass:
              "opacity-0 scale-75 translate-x-full translate-y-0 translate-z-0",
            enterActiveClass: "transition-all duration-200 ease-out",
            leaveActiveClass: "transition-all duration-200 ease-out",
            leaveToClass:
              "opacity-0 scale-75 opacity-0 scale-75 translate-x-full translate-y-0 translate-z-0",
          }
        : {
            enterFromClass: "opacity-0 scale-75",
            enterActiveClass: "transition-all duration-200 ease-out",
            leaveActiveClass: "transition-all duration-200 ease-out",
            leaveToClass: "opacity-0 scale-75",
          },
  },
  toast: {
    root: {
      class: ["w-96", "opacity-90"],
    },
    container: ({ props }) => ({
      class: [
        "my-4 rounded-md w-full",
        {
          "bg-blue-100 border-solid border-0 border-l-4 border-blue-500 text-blue-700":
            props.message.severity == "info",
          "bg-green-100 border-solid border-0 border-l-4 border-green-500 text-green-700":
            props.message.severity == "success",
          "bg-orange-100 border-solid border-0 border-l-4 border-orange-500 text-orange-700":
            props.message.severity == "warn",
          "bg-red-100 border-solid border-0 border-l-4 border-red-500 text-red-700":
            props.message.severity == "error",
        },
      ],
    }),
    content: "flex items-center py-5 px-7",
    icon: {
      class: ["w-6 h-6", "text-lg mr-2"],
    },
    text: "text-base font-normal flex flex-col flex-1 grow shrink ml-4",
    summary: "font-bold block",
    detail: "mt-1 block",
    closebutton: {
      class: [
        "w-8 h-8 rounded-full bg-transparent transition duration-200 ease-in-out",
        "ml-auto overflow-hidden relative",
        "flex items-center justify-center",
        "hover:bg-white/30",
      ],
    },
    transition: {
      enterFromClass: "opacity-0 translate-x-0 translate-y-2/4 translate-z-0",
      enterActiveClass: "transition-transform transition-opacity duration-300",
      leaveFromClass: "max-h-40",
      leaveActiveClass: "transition-all duration-500 ease-in",
      leaveToClass: "max-h-0 opacity-0 mb-0 overflow-hidden",
    },
  },
  directives: {
    tooltip: {
      root: ({ context }) => ({
        class: [
          "absolute shadow-md",
          {
            "py-0 px-1":
              context?.right ||
              context?.left ||
              (!context?.right &&
                !context?.left &&
                !context?.top &&
                !context?.bottom),
            "py-1 px-0": context?.top || context?.bottom,
          },
        ],
      }),
      arrow: ({ context }) => ({
        class: [
          "absolute w-0 h-0 border-transparent border-solid",
          {
            "-m-t-1 border-y-[0.25rem] border-r-[0.25rem] border-l-0 border-r-gray-600":
              context?.right ||
              (!context?.right &&
                !context?.left &&
                !context?.top &&
                !context?.bottom),
            "-m-t-1 border-y-[0.25rem] border-l-[0.25rem] border-r-0 border-l-gray-600":
              context?.left,
            "-m-l-1 border-x-[0.25rem] border-t-[0.25rem] border-b-0 border-t-gray-600":
              context?.top,
            "-m-l-1 border-x-[0.25rem] border-b-[0.25rem] border-t-0 border-b-gray-600":
              context?.bottom,
          },
        ],
      }),
      text: {
        class:
          "p-2 bg-gray-600 text-white rounded-md whitespace-pre-line break-words text-sm",
      },
    },
  },

  global: {
    css: `
        .progress-spinner-circle {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: 0;
            animation: p-progress-spinner-dash 1.5s ease-in-out infinite, p-progress-spinner-color 6s ease-in-out infinite;
            stroke-linecap: round;
        }

        @keyframes p-progress-spinner-dash{
            0% {
                stroke-dasharray: 1, 200;
                stroke-dashoffset: 0;
            }
            
            50% {
                stroke-dasharray: 89, 200;
                stroke-dashoffset: -35px;
            }
            100% {
                stroke-dasharray: 89, 200;
                stroke-dashoffset: -124px;
            }
        }
        @keyframes p-progress-spinner-color {
            100%, 0% {
                stroke: #ff5757;
            }
            40% {
                stroke: #696cff;
            }
            66% {
                stroke: #1ea97c;
            }
            80%, 90% {
                stroke: #cc8925;
            }
        }
    `,
  },
  progressspinner: {
    root: {
      class: [
        "relative mx-auto w-28 h-28 inline-block",
        "before:block before:pt-full",
      ],
    },
    spinner:
      "absolute top-0 bottom-0 left-0 right-0 m-auto w-full h-full transform origin-center animate-spin",
    circle: "text-red-500 progress-spinner-circle",
  },
};
