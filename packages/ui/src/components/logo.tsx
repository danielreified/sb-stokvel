import * as React from 'react';
import { cn } from '../cn.js';

type LogoVariant = 'mark' | 'full';
type LogoTone = 'default' | 'light';

export interface LogoProps extends React.SVGAttributes<SVGSVGElement> {
  variant?: LogoVariant;
  tone?: LogoTone;
}

export const Logo = React.forwardRef<SVGSVGElement, LogoProps>(
  ({ variant = 'mark', tone = 'default', className, ...props }, ref) => {
    const uid = React.useId().replace(/:/g, '');
    const gid = (n: number) => `${uid}-g${n}`;
    const viewBox = variant === 'mark' ? '20 245 140 158' : '20 245 615 158';
    const aspect = variant === 'mark' ? 'aspect-[140/158]' : 'aspect-[615/158]';
    const wordmarkFill = tone === 'light' ? '#FFFFFF' : '#0033A1';

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Standard Bank"
        className={cn('h-10 w-auto', aspect, className)}
        {...props}
      >
        <defs>
          <linearGradient
            id={gid(16)}
            gradientUnits="userSpaceOnUse"
            x1="-148.8666"
            y1="602.118"
            x2="-146.4616"
            y2="600.054"
            gradientTransform="matrix(45.058 0 0 -52.8233 6741.6538 32056.9941)"
          >
            <stop offset="0.02" stopColor="#005CA4" />
            <stop offset="0.94" stopColor="#002445" />
          </linearGradient>
          <linearGradient
            id={gid(17)}
            gradientUnits="userSpaceOnUse"
            x1="-148.1342"
            y1="601.3302"
            x2="-145.5119"
            y2="599.4812"
            gradientTransform="matrix(38.145 0 0 -45.6661 5687.7012 27722.9043)"
          >
            <stop offset="0.01" stopColor="#7BBBE8" />
            <stop offset="0.11" stopColor="#78B7E5" />
            <stop offset="0.22" stopColor="#6FAADC" />
            <stop offset="0.32" stopColor="#6095CC" />
            <stop offset="0.43" stopColor="#4C78B7" />
            <stop offset="0.44" stopColor="#4A76B5" />
            <stop offset="0.48" stopColor="#3E72B2" />
            <stop offset="0.56" stopColor="#1E67AB" />
            <stop offset="0.62" stopColor="#005CA4" />
            <stop offset="0.79" stopColor="#004176" />
            <stop offset="0.99" stopColor="#002445" />
          </linearGradient>
          <linearGradient
            id={gid(18)}
            gradientUnits="userSpaceOnUse"
            x1="-114.2228"
            y1="584.2598"
            x2="-111.3306"
            y2="584.2598"
            gradientTransform="matrix(6.0914 0 0 -12.2851 811.8277 7517.9487)"
          >
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.02" stopColor="#FDFDFD" />
            <stop offset="0.42" stopColor="#DFDFDF" />
            <stop offset="0.76" stopColor="#CDCDCD" />
            <stop offset="1" stopColor="#C6C6C6" />
          </linearGradient>
          <linearGradient
            id={gid(19)}
            gradientUnits="userSpaceOnUse"
            x1="-145.1094"
            y1="503.2867"
            x2="-142.2172"
            y2="503.2867"
            gradientTransform="matrix(25.1581 0 0 -2.0785 3709.1055 1312.2384)"
          >
            <stop offset="0" stopColor="#C6C6C6" />
            <stop offset="0.24" stopColor="#CDCDCD" />
            <stop offset="0.58" stopColor="#DFDFDF" />
            <stop offset="0.98" stopColor="#FDFDFD" />
            <stop offset="1" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient
            id={gid(20)}
            gradientUnits="userSpaceOnUse"
            x1="279.4998"
            y1="539.6359"
            x2="440.5948"
            y2="539.6359"
            gradientTransform="matrix(25.0726 0 0 -3.4075 3696.5173 2123.2495)"
          >
            <stop offset="0" stopColor="#C6C6C6" />
            <stop offset="0.24" stopColor="#CDCDCD" />
            <stop offset="0.58" stopColor="#DFDFDF" />
            <stop offset="0.98" stopColor="#FDFDFD" />
            <stop offset="1" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient
            id={gid(21)}
            gradientUnits="userSpaceOnUse"
            x1="356.7881"
            y1="532.2212"
            x2="450.3794"
            y2="532.2212"
            gradientTransform="matrix(14.569 0 0 -3.4473 2100.3872 2162.2224)"
          >
            <stop offset="0" stopColor="#C6C6C6" />
            <stop offset="0.24" stopColor="#CDCDCD" />
            <stop offset="0.58" stopColor="#DFDFDF" />
            <stop offset="0.98" stopColor="#FDFDFD" />
            <stop offset="1" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient
            id={gid(22)}
            gradientUnits="userSpaceOnUse"
            x1="653.6323"
            y1="584.3632"
            x2="660.805"
            y2="584.3632"
            gradientTransform="matrix(1.0942 0 0 -11.0303 52.3223 6743.4883)"
          >
            <stop offset="0" stopColor="#C6C6C6" />
            <stop offset="0.24" stopColor="#CDCDCD" />
            <stop offset="0.58" stopColor="#DFDFDF" />
            <stop offset="0.98" stopColor="#FDFDFD" />
            <stop offset="1" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient
            id={gid(23)}
            gradientUnits="userSpaceOnUse"
            x1="-116.1208"
            y1="548.6585"
            x2="-113.2286"
            y2="548.6585"
            gradientTransform="matrix(6.249 0 0 -4.9467 832.8975 3085.2058)"
          >
            <stop offset="0" stopColor="#C6C6C6" />
            <stop offset="0.09" stopColor="#D8D8D8" />
            <stop offset="0.22" stopColor="#EEEEEE" />
            <stop offset="0.34" stopColor="#FBFBFB" />
            <stop offset="0.46" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient
            id={gid(24)}
            gradientUnits="userSpaceOnUse"
            x1="331.1891"
            y1="592.6049"
            x2="400.0522"
            y2="592.6049"
            gradientTransform="matrix(10.7197 0 0 -20.6519 1506.7366 12586.8564)"
          >
            <stop offset="0" stopColor="#C6C6C6" />
            <stop offset="0.24" stopColor="#CDCDCD" />
            <stop offset="0.58" stopColor="#DFDFDF" />
            <stop offset="0.98" stopColor="#FDFDFD" />
            <stop offset="1" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient
            id={gid(25)}
            gradientUnits="userSpaceOnUse"
            x1="249.4154"
            y1="596.1005"
            x2="338.7262"
            y2="596.1005"
            gradientTransform="matrix(13.9027 0 0 -27.3109 1981.9626 16613.791)"
          >
            <stop offset="0" stopColor="#C6C6C6" />
            <stop offset="0.24" stopColor="#CDCDCD" />
            <stop offset="0.58" stopColor="#DFDFDF" />
            <stop offset="0.98" stopColor="#FDFDFD" />
            <stop offset="1" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient
            id={gid(26)}
            gradientUnits="userSpaceOnUse"
            x1="385.1914"
            y1="459.1422"
            x2="412.1467"
            y2="459.1422"
            gradientTransform="matrix(4.196 0 0 -1.9796 512.019 1293.1487)"
          >
            <stop offset="0" stopColor="#C6C6C6" />
            <stop offset="0.24" stopColor="#CDCDCD" />
            <stop offset="0.58" stopColor="#DFDFDF" />
            <stop offset="0.98" stopColor="#FDFDFD" />
            <stop offset="1" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient
            id={gid(27)}
            gradientUnits="userSpaceOnUse"
            x1="219.4451"
            y1="599.8519"
            x2="346.3255"
            y2="599.8519"
            gradientTransform="matrix(19.7479 0 0 -44.2165 2872.2961 26846.4727)"
          >
            <stop offset="0" stopColor="#C6C6C6" />
            <stop offset="0.24" stopColor="#CDCDCD" />
            <stop offset="0.58" stopColor="#DFDFDF" />
            <stop offset="0.98" stopColor="#FDFDFD" />
            <stop offset="1" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient
            id={gid(28)}
            gradientUnits="userSpaceOnUse"
            x1="192.9141"
            y1="27.5604"
            x2="192.9141"
            y2="42.3684"
            gradientTransform="matrix(0.7113 0 0 -2.3148 -6.6617 1456.9238)"
          >
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.02" stopColor="#FDFDFD" />
            <stop offset="0.42" stopColor="#DFDFDF" />
            <stop offset="0.76" stopColor="#CDCDCD" />
            <stop offset="1" stopColor="#C6C6C6" />
          </linearGradient>
          <linearGradient
            id={gid(29)}
            gradientUnits="userSpaceOnUse"
            x1="273.4607"
            y1="571.6578"
            x2="309.3239"
            y2="571.6578"
            gradientTransform="matrix(5.5647 0 0 -6.4642 706.7874 3971.0894)"
          >
            <stop offset="0" stopColor="#C6C6C6" />
            <stop offset="0.24" stopColor="#CDCDCD" />
            <stop offset="0.58" stopColor="#DFDFDF" />
            <stop offset="0.98" stopColor="#FDFDFD" />
            <stop offset="1" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient
            id={gid(30)}
            gradientUnits="userSpaceOnUse"
            x1="-148.0345"
            y1="601.4854"
            x2="-145.5477"
            y2="599.4014"
            gradientTransform="matrix(38.3066 0 0 -45.9922 5712.3062 27920.2324)"
          >
            <stop offset="0.54" stopColor="#FFFFFF" />
            <stop offset="0.66" stopColor="#FBFBFB" />
            <stop offset="0.78" stopColor="#EEEEEE" />
            <stop offset="0.91" stopColor="#D8D8D8" />
            <stop offset="1" stopColor="#C6C6C6" />
          </linearGradient>
        </defs>

        <g transform="translate(0 1)">
          <path
            fill={`url(#${gid(16)})`}
            d="M85.2,395.8c-35.6-11.8-58-37-61.4-69.3c-1.5-13.7,1-44.5,2.6-61.7c0.5-7.5,5.9-13.8,13.2-15.5c16.1-3.4,32.4-5.2,48.9-5.2c16.4,0.1,32.8,1.8,48.8,5.2c7.3,1.6,12.7,7.9,13.3,15.5l0.1,1.1c2.1,23.1,4.1,48.4,2.4,60.8c-5.2,38.1-35,60.6-61.2,69l-3.4,1.1L85.2,395.8z"
          />
          <path
            fill={`url(#${gid(17)})`}
            d="M140.8,264.8c-0.1-3-2.2-5.6-5.1-6.3c-15.4-3.3-31-5-46.7-5.1c-15.7,0.1-31.4,1.8-46.7,5.1c-2.9,0.7-5,3.3-5.1,6.3c-1.2,12.9-4,46.3-2.6,59.6c3.2,30.1,24.9,50.1,50.9,59.8c1.3,0.5,2.6,0.9,3.9,1.3c0.3-0.1,9-2.5,9-2.5c1.7-0.9,7.3-3.6,9-4.7c16.7-10.9,31-33.2,36.1-53.9C146.5,311.3,142,277.7,140.8,264.8z"
          />
          <path
            fill={`url(#${gid(18)})`}
            d="M116,358c9-9.2,14.7-21.2,16-34.1l1.7-1.5c-0.7,15.3-7.3,25.2-16,33.9"
          />
          <path
            fill={`url(#${gid(19)})`}
            d="M131.2,267.5c0,0-33.6-8.3-71.2-2.1l-1.6,1.6c9.7-1.4,19.5-2.1,29.2-2.2c14.1,0.1,28.1,1.5,41.9,4.3L131.2,267.5z"
          />
          <path
            fill={`url(#${gid(20)})`}
            d="M132.4,281.8l-1.6,1.7c-4.8,2.7-11.2,5.9-20.2,5.9c-0.7,0-1.3,0-2,0c-12.5-0.7-19.7-7.7-30.2-8.2c-0.7,0-1.4,0-2,0c-5.7-0.1-11.4,1.3-16.4,4.1l1.6-1.6c5-2.8,10.7-4.2,16.4-4.1c0.7,0,1.4,0,2,0c10.4,0.6,17.8,7.3,30.3,8c0.7,0,1.3,0,2,0C119.4,287.5,126.3,285.5,132.4,281.8"
          />
          <path
            fill={`url(#${gid(21)})`}
            d="M133.6,322.5l-1.6,1.6c-3.1,2.9-10.9,8.4-20.1,8.4c-9.6,0-15.5-3.9-20.5-5.4l1.6-1.6c5,1.6,10.9,5,20.5,5C120.9,330.3,128,327.5,133.6,322.5"
          />
          <path
            fill={`url(#${gid(22)})`}
            d="M132.3,281.8l-1.6,1.6c0.5,7.4,1.1,15.6,1.3,23l0.1,7.3l1.7-1.6C133.9,312.2,134,293.5,132.3,281.8z"
          />
          <path
            fill={`url(#${gid(23)})`}
            d="M125.3,364l-1.6,1.6c-4.9,4.9-10.5,9.2-16.5,12.7l1.6-1.6C114.9,373.2,120.4,368.9,125.3,364z"
          />
          <polygon fill={`url(#${gid(24)})`} points="108.8,376.7 107.3,378.3 77.8,320.2 79.4,318.6" />
          <polygon fill={`url(#${gid(25)})`} points="84,371.7 82.1,373.3 43.8,296.2 45.4,294.3" />
          <path
            fill={`url(#${gid(26)})`}
            d="M99.8,381.4l-1.6,1.6c-3.4,1.6-7,2.9-10.5,4.1l1.6-1.6C92.7,383.9,96.2,382.5,99.8,381.4"
          />
          <path
            fill={`url(#${gid(27)})`}
            d="M89.4,385.4l-1.7,1.7c-27.9-9.2-51.6-29.3-55-61.3c-1.4-13.5,1.4-47.2,2.6-60.3c0.1-1.8,0.9-3.4,2.1-4.7l1.6-1.6c-1.2,1.3-2,2.9-2.1,4.7c-1.2,13.1-4,46.7-2.6,60.3C37.7,356.2,61.5,376.2,89.4,385.4"
          />
          <path
            fill={`url(#${gid(28)})`}
            d="M131.6,272.6l-1.6,1.6c-0.2-1.7-0.4-3.5-0.5-5l1.7-1.7C131.2,267.5,131.6,270.8,131.6,272.6z"
          />
          <path
            fill={`url(#${gid(29)})`}
            d="M61.4,277.6c0-0.9-0.4-1.7-1.1-2.2l-11.5-8.7c-0.2-0.2-0.5-0.3-0.8-0.3c-0.4,0-0.7,0.1-1,0.4l-1.6,1.6c0.3-0.3,0.6-0.4,1-0.4c0.3,0,0.6,0.1,0.8,0.3l11.5,8.7c0.7,0.6,1.1,1.4,1.1,2.3v5.8l1.6-1.6V277.6z"
          />
          <path
            fill={`url(#${gid(30)})`}
            stroke="#FFFFFF"
            strokeWidth="1.4461"
            d="M141.7,264c-0.1-3.1-2.2-5.7-5.2-6.4c-15.5-3.3-31.4-5-47.2-5.1c-15.9,0.1-31.7,1.8-47.2,5.1c-3,0.7-5.1,3.3-5.2,6.4c-1.2,13.1-4,46.8-2.6,60.3c3.3,30.5,24.9,50.2,51.1,59.9c1.3,0.5,2.6,0.9,3.9,1.3l0.9-0.3h0.1c3.3-1.1,6.5-2.4,9.6-3.8l-47.4-93.2l-4.7-3.5c-0.7-0.5-1.2-1.4-1.2-2.3v-14.5c0-0.8,0.6-1.4,1.4-1.5c0.3,0,0.6,0.1,0.8,0.3l11.5,8.7c0.7,0.6,1.1,1.4,1.1,2.3v5.8c5-2.8,10.7-4.2,16.4-4.1c0.7,0,1.3,0,2,0c10.4,0.6,17.7,7.6,30.2,8.2c0.7,0,1.3,0,2,0c9,0,15.4-3.2,20.2-5.9c0.5,7.4,1.1,15.6,1.3,23l0.1,7.3c-5.7,4.7-15,8.8-20.3,8.8c-8.8,0-14.8-5.6-23.1-5.6c-3.9,0-7.7,1.2-11,3.3l29.4,58.1c3.6-2.1,7.1-4.6,10.4-7.2c13.4-10.9,22.9-25.9,24.9-45.3C145.7,310.7,142.9,277,141.7,264z M83.7,371.7c-0.9-0.4-1.8-0.8-2.7-1.2C61.4,360.9,47.4,345.1,45,323c-0.6-6.1-0.3-17.1,0.4-28.4L83.7,371.7z M112.1,278.1c-0.7,0-1.3,0-2,0c-12.5-0.7-19.4-7.2-29.9-7.7c-0.6,0-1.2,0-1.7,0c-3.2,0-6.3,0.4-9.3,1.3l-9.2-6.3c9.7-1.4,19.5-2.1,29.3-2.1c14.1,0.1,28.1,1.5,41.9,4.2c0,0,0.3,3.4,0.4,5.1C125.7,276.2,119,278.1,112.1,278.1z M112.3,361.2l-16-31.6c-0.8-1.6-1.9-3-3.2-4.1c5,1.6,10.9,5.4,20.5,5.4c9.2,0,16.9-5.5,20.1-8.4v0.5C131.8,339.1,123.9,351.8,112.3,361.2z"
          />
        </g>

        {variant === 'full' && (
          <g transform="translate(53.575758 0.307692)">
            <path
              fill={wordmarkFill}
              d="M384.5,333c-1.8,2.2-4.4,3.6-7.3,3.7c-4.1,0-6.6-3.3-6.6-11.2c0-8.3,2.7-11.4,7-11.4c2.5,0.1,5,1,6.9,2.6V333z M393.6,343.5v-53.7l-9.1,1.3v19.7c-2.5-2.1-5.3-4.4-10.2-4.4c-8.5,0-13.3,7.1-13.3,19.2c0,11.8,5.5,18.6,13.8,18.6c4-0.1,7.8-2,10.3-5.1l0.6,4.3L393.6,343.5z M359.7,314.7v-8.2c-7.7,0.1-11.9,5.4-13.2,6.8l-0.7-6H338v36.3h9.1v-23.9C348.6,318.3,352,314.8,359.7,314.7L359.7,314.7z M320.4,334.8c-1.7,1.7-4,2.7-6.4,2.8c-2.5,0-4.9-1.1-4.9-5c0-4.9,3.5-6.1,11.2-6.6V334.8z M329.2,343.5v-22.7c0-8-0.2-14.3-11.7-14.3c-4.8,0.2-9.6,1.3-14,3.2l1.6,5.2c3-0.9,6.2-1.4,9.3-1.5c5.3,0,6,1.9,6,6.1v1.9c-8.2,0.5-20,0.2-20,11.6c0,7.7,4.4,11.3,10,11.3c4-0.2,7.7-1.9,10.4-4.9l0.7,4.1L329.2,343.5z M285.2,333.1c-1.8,2.2-4.4,3.6-7.3,3.7c-4.1,0-6.6-3.3-6.6-11.2c0-8.3,2.7-11.4,7-11.4c2.5,0.1,5,1,6.9,2.6V333.1z M294.3,343.5v-53.7l-9.1,1.3v19.7c-2.5-2.1-5.3-4.4-10.2-4.4c-8.5,0-13.3,7.1-13.3,19.2c0,11.8,5.5,18.6,13.8,18.6c4-0.1,7.8-2,10.3-5.1l0.6,4.3L294.3,343.5z M254.5,343.5v-23.7c0-5.9-0.3-13.4-10.2-13.4c-5.2,0-10.2,3.7-12.4,5.6l-0.7-4.8h-7.9v36.3h9.1v-26.2c1.4-0.9,5-3.3,8.3-3.3c4.1,0,4.5,2.9,4.5,7.5v22L254.5,343.5z M206.3,334.8c-1.7,1.7-4,2.7-6.4,2.8c-2.5,0-4.9-1.1-4.9-5c0-4.9,3.5-6.1,11.2-6.6V334.8z M215.1,343.5v-22.7c0-8-0.2-14.3-11.7-14.3c-4.8,0.2-9.6,1.3-14,3.2l1.6,5.2c3-0.9,6.2-1.4,9.3-1.5c5.3,0,6,1.9,6,6.1v1.9c-8.2,0.5-20,0.2-20,11.6c0,7.7,4.4,11.3,10,11.3c4-0.2,7.7-1.9,10.4-4.9l0.7,4.1L215.1,343.5z M184.2,341.7l-1.9-5.2c-1.9,0.7-3.9,1.1-6,1.1c-3.8,0-4-2.4-4-5.4v-18.8h10l0.9-6.2h-10.8v-11.5l-7.9,1.3l-1.3,10.2l-6.1,1.1v5h6.1v17.6c0,5,0.2,8.9,2.8,11.2c1.5,1.3,3.9,2.2,7.3,2.2C177.1,344.3,180.9,343.4,184.2,341.7L184.2,341.7z M156.5,328.3c0-8.7-5.4-11.8-12.9-14.2c-6.7-2.1-10.9-3.4-10.9-7.9c0-4.9,4.1-6.9,8.7-6.9c3.9,0.1,7.8,0.8,11.4,2.1l2.1-6.4c-4.5-1.9-9.3-2.9-14.2-3c-10.8,0-17.5,5.6-17.5,14.9c0,14.4,15.4,13.4,21.4,18c1.5,1.1,2.4,2.9,2.4,4.7c0,4.3-3.7,7.3-9.6,7.3c-4,0-8-1-11.6-2.9l-3.2,6.3c0.4,0.4,6.1,3.9,15.3,3.9C149.9,344.2,156.6,338.3,156.5,328.3L156.5,328.3z M568.5,343.6l-15.1-19l14.1-17.3h-9.7l-13,16.2v-33.6l-9.1,1.3v52.4h9.1v-17l13.1,17H568.5z M527.4,343.6v-23.7c0-5.9-0.3-13.4-10.2-13.4c-5.2,0-10.2,3.7-12.4,5.6l-0.7-4.8h-7.9v36.3h9.1v-26.2c1.4-0.9,5-3.3,8.3-3.3c4.1,0,4.6,2.9,4.6,7.5v22L527.4,343.6z M479.3,334.8c-1.7,1.7-4,2.7-6.4,2.8c-2.5,0-4.9-1.1-4.9-5c0-4.9,3.5-6.1,11.2-6.6V334.8z M488.1,343.5v-22.7c0-8-0.2-14.3-11.7-14.3c-4.8,0.2-9.6,1.3-14,3.2l1.6,5.2c3-0.9,6.2-1.4,9.3-1.5c5.3,0,6,1.9,6,6.1v1.9c-8.2,0.5-20,0.2-20,11.6c0,7.7,4.4,11.3,10,11.3c4-0.2,7.7-1.9,10.4-4.9l0.7,4.1L488.1,343.5z M444.3,328.5c0,3.7-1.5,6-3.8,7.2c-2.3,1.1-4.6,1.1-8.7,1.1h-3.5v-16h4.9c4.5,0,6.1,0.2,7.7,1.1C443.1,322.9,444.4,325.1,444.3,328.5L444.3,328.5z M443.7,306.4c0,5.8-2.7,7.9-11.5,7.9h-3.9v-14.9h4.9c4.5,0,6.2,0.2,7.9,1.2C442.8,301.9,443.9,304.1,443.7,306.4L443.7,306.4z M454.1,329.7c0-7.7-4.2-11.6-11.7-12.4c7-1.1,10.5-5.2,10.5-12.1c0-12.5-10.8-12.7-20-12.7H419v50.9h12.4c8.9,0,11.5-0.3,14.6-1.5C451.1,340.2,454.4,335.2,454.1,329.7L454.1,329.7z"
            />
          </g>
        )}
      </svg>
    );
  },
);
Logo.displayName = 'Logo';
