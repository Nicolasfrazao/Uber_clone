import { TouchableOpacity, Text } from "react-native";

import { ButtonProps } from "@/types/type";

/**
 * A function that returns a CSS class string based on the variant of the button.
 * The variant can be one of the following: "primary", "secondary", "danger", "success", or "outline".
 * The function will return the corresponding CSS class string to style the button.
 * If the variant is not specified, the function will return "bg-[#0286FF]"
 */
const getBgVariantStyle = (variant: ButtonProps["bgVariant"]): string => {
  switch (variant) {
    case "secondary":
      return "bg-gray-500";
    case "danger":
      return "bg-red-500";
    case "success":
      return "bg-green-500";
    case "outline":
      return "bg-transparent border-neutral-300 border-[0.5px]";
    default:
      return "bg-[#0286FF]";
  }
};

/**
 * A function that returns a CSS class string based on the variant of the text in the button.
 * The variant can be one of the following: "primary", "secondary", "danger", "success", or "default".
 * The function will return the corresponding CSS class string to style the text.
 * If the variant is not specified, the function will return "text-white"
 */
const getTextVariantStyle = (variant: ButtonProps["textVariant"]): string => {
  switch (variant) {
    case "primary":
      return "text-black";
    case "secondary":
      return "text-gray-100";
    case "danger":
      return "text-red-100";
    case "success":
      return "text-green-100";
    default:
      return "text-white";
  }
};

/**
 * A function that returns a React component that renders a button with the specified properties.
 * The function takes in the following properties: onPress, title, bgVariant, textVariant, IconLeft, IconRight, className, and any other props.
 * It returns a TouchableOpacity component with the specified properties.
 * The TouchableOpacity component is styled with the class string returned by getBgVariantStyle() and the class string returned by getTextVariantStyle().
 * The TouchableOpacity component also receives the className property if it is specified.
 */
const CustomButton = ({
  onPress,
  title,
  bgVariant = "primary",
  textVariant = "default",
  IconLeft,
  IconRight,
  className,
  ...props
}: ButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={
        `w-full rounded-full p-3 flex flex-row justify-center items-center shadow-md shadow-neutral-400/70 ` +
        `${getBgVariantStyle(bgVariant)} ` +
        `${getTextVariantStyle(textVariant)} ` +
        `${className}`
      }
      {...props}
    >
      {IconLeft && <IconLeft />}
      <Text className={`text-lg font-bold ${getTextVariantStyle(textVariant)}`}>
        {title}
      </Text>
      {IconRight && <IconRight />}
    </TouchableOpacity>
  );
};

export default CustomButton;

