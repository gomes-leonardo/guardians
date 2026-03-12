import { User } from './user.entity';

describe('User Entity', () => {
  const validProps = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'secret12',
  };

  it('should create a valid user', () => {
    const user = new User(
      validProps.name,
      validProps.email,
      validProps.password,
    );
    expect(user.name).toBe(validProps.name);
    expect(user.email).toBe(validProps.email);
    expect(user.password).toBe(validProps.password);
  });

  it('should allow creating a user without password (e.g. from DB hydration)', () => {
    const user = new User('John', 'john@example.com', undefined, '123');
    expect(user.id).toBe('123');
    expect(user.password).toBeUndefined();
  });

  describe('name validation', () => {
    it('should throw if name is empty', () => {
      expect(() => new User('', validProps.email, validProps.password)).toThrow(
        'User name is required',
      );
    });
  });

  describe('email validation', () => {
    it('should throw if email is empty', () => {
      expect(() => new User(validProps.name, '', validProps.password)).toThrow(
        'User email is required',
      );
    });

    it.each(['invalid', 'user@', '@domain.com', 'user @mail.com'])(
      'should throw for invalid email: %s',
      (email) => {
        expect(
          () => new User(validProps.name, email, validProps.password),
        ).toThrow('Invalid email format');
      },
    );

    it.each(['user@mail.com', 'a@b.co', 'test.user+tag@domain.org'])(
      'should accept valid email: %s',
      (email) => {
        expect(
          () => new User(validProps.name, email, validProps.password),
        ).not.toThrow();
      },
    );
  });

  describe('password validation', () => {
    it.each(['short1', 'abcdefgh', '12345678', 'abc', ''])(
      'should throw for weak password: "%s"',
      (password) => {
        expect(
          () => new User(validProps.name, validProps.email, password),
        ).toThrow(
          'Password must be at least 8 characters with at least 1 letter and 1 number',
        );
      },
    );

    it.each(['secret12', 'Password1', 'abcdefg1', '1234567a'])(
      'should accept strong password: "%s"',
      (password) => {
        expect(
          () => new User(validProps.name, validProps.email, password),
        ).not.toThrow();
      },
    );
  });
});
