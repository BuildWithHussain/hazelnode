import { DataInteractive as HeadlessDataInteractive } from '@headlessui/react';
import React from 'react';
import { Link as TanstackLink, type LinkProps } from '@tanstack/react-router';

export const Link = React.forwardRef(function Link(
  props: { to: LinkProps['to'] } & Omit<LinkProps, 'to'>,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  return (
    <HeadlessDataInteractive>
      <TanstackLink {...props} ref={ref} to={props.to} params={props.params} />
    </HeadlessDataInteractive>
  );
});
