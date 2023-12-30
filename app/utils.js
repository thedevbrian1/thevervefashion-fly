import { json } from "@remix-run/node";

export const navLinks = [
    {
        text: 'About',
        path: '/about'
    },
    {
        text: 'Dresses',
        path: '/category/dresses'
    },
    {
        text: 'Lounge wear',
        path: '/category/lounge-wear'
    },
    {
        text: 'Accessories',
        path: '/category/accessories'
    },
    {
        text: 'Corset tops',
        path: '/category/corset-tops'
    },
    {
        text: 'Contacts',
        path: '/contact'
    }
];

export const featuredProducts = [
    {
        imageSrc: '/loungewear.jpeg',
        name: 'Dress',
        rating: '4.5',
        price: '3999',
        oldPrice: '4999',
        id: 1
    },
    {
        imageSrc: '/corset-top.jpg',
        name: 'Corset top',
        rating: '4.5',
        price: '3999',
        oldPrice: '4999',
        id: 2
    },
    {
        imageSrc: '/two-piece-set.jpg',
        name: 'Two piece set',
        rating: '4.5',
        price: '3999',
        oldPrice: '4999',
        id: 3
    },
    {
        imageSrc: '/loungewear.jpeg',
        name: 'Dress',
        rating: '4.5',
        price: '3999',
        oldPrice: '4999',
        id: 4
    },
    {
        imageSrc: '/loungewear.jpeg',
        name: 'Dress',
        rating: '4.5',
        price: '3999',
        oldPrice: '4999',
        id: 5
    },
];

export function validateEmail(email) {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (typeof email !== "string" || !pattern.test(email)) {
        return 'Email is invalid';
    }
}

export function validatePassword(password) {
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const numberRegex = /[0-9]/;
    const specialCharRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\-]/;

    if (password.length < 8) {
        return 'Password must be at least 8 characters long';
    } else if (!uppercaseRegex.test(password) || !lowercaseRegex.test(password) || !numberRegex.test(password) || !specialCharRegex.test(password)) {
        return 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
}

export function validatePhone(phone) {
    // if (typeof phone !== "string" || phone.length < 10) {
    //   return 'Phone number is invalid';
    // }
    const safariomRegex = /^(?:254|\+254|0)?([71](?:(?:0[0-8])|(?:[12][0-9])|(?:9[0-9])|(?:4[0-3])|(?:4[68]))[0-9]{6})$/;

    const airtelRegex = /^(?:254|\+254|0)?(7(?:(?:3[0-9])|(?:5[0-6])|(?:8[0-2])|(?:8[6-9]))[0-9]{6})$/;

    const telkomRegex = /^(?:254|\+254|0)?(77[0-9][0-9]{6})$/;

    if (!phone.match(safariomRegex) && !phone.match(airtelRegex) && !phone.match(telkomRegex)) {
        return 'Phone number is invalid';
    }
}

export function trimValue(value) {
    return value.replace(/\D+/g, '');
}

export function badRequest(data) {
    return json(data, { status: 404 });
}