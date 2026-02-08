/**
 * Support Layout Route
 *
 * Simple pass-through layout for nested support pages.
 * Required by React Router for nested route structure.
 */

import {Outlet} from 'react-router';

export default function SupportLayout() {
  return <Outlet />;
}
