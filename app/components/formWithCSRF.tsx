import { Form } from "@remix-run/react";

type SecureFormProps = React.ComponentProps<typeof Form> & {
  csrf: string;
};

export function SecureForm({ csrf, children, ...props }: SecureFormProps) {
  return (
    <Form {...props}>
      <input type="hidden" name="csrf" value={csrf} />
      {children}
    </Form>
  );
}
