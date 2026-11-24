// What the car is and what the team is working on. Update this each quarter.
// Source: final Torpedo Kid report for the first quarter of 2026-2027.
import frontFrame from './assets/images/torpedo/car/front-frame.jpg';
import rearFrame from './assets/images/torpedo/car/rear-frame.jpg';
import steering from './assets/images/torpedo/car/steering.jpg';
import driveShaft from './assets/images/torpedo/car/drive-shaft.jpg';
import brakes from './assets/images/torpedo/car/brake-disc.jpg';
import pedals from './assets/images/torpedo/car/pedal-box.jpg';

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
    text: 'The car is built in three sections. We received the front and rear frames fully welded and the middle frame as labelled steel bars, which Summa students welded and assembled. The roll cage is part of the middle frame.',
    image: frontFrame,
    alt: 'The red front frame on the workshop floor with steering rack, wishbones and wheels attached.',
  },
  {
    name: 'Suspension',
    text: 'The coilovers we started with were too weak for the finished car. We calculated the loads for a 3 g hit and selected stronger ones. Next we check the full range of motion and work out the spring stiffness.',
    image: rearFrame,
    alt: 'The rear frame with a yellow coilover mounted above a wishbone and pushrod.',
  },
  {
    name: 'Steering',
    text: 'The steering wheel used to sit between the driver’s knees. We rerouted the column over the frame to bring it up to chest height, and chose a compact GT3-style rim. Next we make and install the parts.',
    image: steering,
    alt: 'CAD view of a driver holding the steering wheel, with the column passing over the front frame.',
    cad: true,
  },
  {
    name: 'Drive shafts',
    text: 'Standard shafts don’t fit our motor. We designed custom rear axles that keep the Mazda MX-5 joints at the wheels and use a different joint at the motor. Next we make them and test them through the suspension’s movement.',
    image: driveShaft,
    alt: 'CAD view of a rear drive shaft with a joint at each end.',
    cad: true,
  },
  {
    name: 'Brakes',
    text: 'There is no room for a brake booster, so we designed a hydraulic system that works without one, using Mazda MX-5 calipers. Our calculations show too much braking at the front for this car’s weight, so we are adjusting the balance.',
    image: brakes,
    alt: 'A rear brake disc and hub carrier seen through the spokes of a wheel.',
  },
  {
    name: 'Pedals',
    text: 'The pedal box holds an electric throttle, a floor-mounted brake pedal and a footrest, and has to clear the steering shaft. The design is done, with a steel main bracket. Next we make and install it.',
    image: pedals,
    alt: 'CAD view of the pedal box: a slotted footrest on the left, the brake pedal in the middle and the throttle on the right.',
    cad: true,
  },
  {
    name: 'Battery and electronics',
    text: 'Two battery modules run in parallel at about 94 volts. A management system watches the cells, and the parts talk over one shared CAN network. Next we choose the last components and finish the network before wiring the car.',
  },
  {
    name: 'Cooling',
    text: 'We found a suitable BMW radiator and are testing the idea of a heatsink under the batteries. The first heatsink design was too large, so we are making it smaller and working out how the two fit together.',
  },
];

export const years: [string, string][] = [
  ['2022–23', 'First concept, requirements and CAD designs.'],
  ['2023–24', 'Front and rear frames built, with the motor in place at the back. Rack-and-pinion steering chosen.'],
  ['2024–25', 'Middle frame designed, with the batteries under the driver.'],
  ['2025–26', 'Parts built and assembled, and the frame put together in CAD.'],
  ['2026–27', 'This year: make the car driveable on a private road.'],
];
