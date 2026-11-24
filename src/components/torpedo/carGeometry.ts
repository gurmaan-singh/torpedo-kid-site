// Side view of the Torpedo Kid, 8 units to the inch: 12 ft long (1152),
// 6 ft 6 in wheelbase (624), 28 in wheels (radius 112). Ground is y = 430.
export const GROUND = 430;
export const WHEEL_R = 112;
export const WHEEL_Y = GROUND - WHEEL_R;
export const REAR_X = 300;
export const FRONT_X = REAR_X + 624;
export const BODY =
  'M24 322 C120 262 300 160 520 148 C760 136 1010 222 1140 336 C1172 364 1182 376 1174 385 C1168 392 1150 393 1126 393 L150 393 C92 393 44 360 24 322 Z';
export const UNDERSIDE =
  'M24 322 C44 360 92 393 150 393 L1126 393 C1150 393 1168 392 1174 385 C1178 380 1177 375 1170 366 C900 352 340 352 24 322 Z';
