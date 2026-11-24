// What the car is and what the team is working on. Update this each quarter.
// Source: Torpedo Kid quarter report, November 2026.
import frontFrame from './assets/images/torpedo/car/front-frame.jpg';
import rearFrame from './assets/images/torpedo/car/rear-frame.jpg';
import steering from './assets/images/torpedo/car/steering.jpg';
import driveShaft from './assets/images/torpedo/car/drive-shaft.jpg';

export const specs: [string, string][] = [
  ['Seats', 'One'],
  ['Motor', '15 kW, rear-wheel drive'],
  ['Battery', '36 kWh in two modules'],
  ['Estimated range', '180 to 240 km'],
  ['Top speed', '80 km/h or more'],
  ['Weight', 'Under 450 kg without battery'],
  ['Suspension', 'Double wishbones'],
  ['Vehicle class', 'L7e heavy quadricycle'],
];

export const workNow = [
  {
    name: 'Chassis',
    text: 'The car is built in three sections. The front and rear frames are welded steel, and the middle frame, which carries the driver, the batteries and the roll cage, joins them together.',
    image: frontFrame,
    alt: 'The red front frame on the workshop floor with steering rack, wishbones and wheels attached.',
  },
  {
    name: 'Suspension',
    text: 'The coilovers we started with were too weak for the finished car. We calculated the loads for a 650 kg car taking a 3 g hit and selected stronger ones. Next we work out the spring stiffness.',
    image: rearFrame,
    alt: 'The rear frame with a yellow coilover mounted above a wishbone and pushrod.',
  },
  {
    name: 'Steering',
    text: 'The steering wheel used to sit between the driver’s knees. We rerouted the column over the frame to bring it up to chest height, and chose a compact GT-style rim to leave more room.',
    image: steering,
    alt: 'CAD view of a driver holding the steering wheel, with the column passing over the front frame.',
    cad: true,
  },
  {
    name: 'Drive shafts',
    text: 'Standard shafts don’t fit our motor. We are designing custom rear axles that keep the Mazda MX-5 joints at the wheels and use a different joint at the motor.',
    image: driveShaft,
    alt: 'CAD view of a rear drive shaft with a joint at each end.',
    cad: true,
  },
  {
    name: 'Battery and electronics',
    text: 'Two battery modules run in parallel at about 94 volts. A management system watches the cells, and the parts talk over one shared CAN network. The emergency stop is designed to be hardwired too, so it doesn’t depend on software. Next we choose the control unit.',
  },
  {
    name: 'Cooling',
    text: 'We are comparing radiators and testing the idea of a heatsink under the batteries. The first heatsink design was too large, so we are making it smaller.',
  },
];

export const years: [string, string][] = [
  ['2022–23', 'First concept, requirements and CAD designs.'],
  ['2023–24', 'Front and rear frames built, with the motor in place at the back. Rack-and-pinion steering chosen.'],
  ['2024–25', 'Middle frame designed, with the batteries under the driver.'],
  ['2025–26', 'Parts built and assembled, and the frame put together in CAD.'],
  ['2026–27', 'This year: make the car driveable on a private road.'],
];
