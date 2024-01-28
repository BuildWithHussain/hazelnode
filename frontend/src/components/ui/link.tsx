import { DataInteractive as HeadlessDataInteractive } from '@headlessui/react';
import React from 'react';
import { Link as TanstackLink, type LinkProps } from '@tanstack/react-router';

export const Link = React.forwardRef(function Link(
  props: { href: LinkProps['to'] } & Omit<LinkProps, 'to'>,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {

  console.log(props);

  return (
    <HeadlessDataInteractive>
      <TanstackLink {...props} ref={ref} to={props.href} params={props.params} />
    </HeadlessDataInteractive>
  );
});
