import React from 'react';
import { useEffect, useState } from 'react';
import style from './style.module.css';

import { Button, Input, Select, Textarea, Group, Container } from '@mantine/core';

import Wrapper from '../../components/wrapper';
import Error from '../../components/info/error';
import Info from '../../components/info/info';
import Share from '../../components/share';
import Expandable from '../../components/expandable';

import { getToken, hasToken } from '../../helpers/token';

import { createSecret, burnSecret } from '../../api/secret';

const Home = () => {
    const [text, setText] = useState('');
    const [isTextActive, setIsTextActive] = useState(false);
    const [file, setFile] = useState('');
    const [ttl, setTTL] = useState(14400);
    const [password, setPassword] = useState('');
    const [allowedIp, setAllowedIp] = useState('');
    const [formData, setFormData] = useState(null);
    const [secretId, setSecretId] = useState('');
    const [encryptionKey, setEncryptionKey] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [error, setError] = useState('');

    useEffect(() => {
        // Run once to initialize the form data to post
        setFormData(new FormData());

        setIsLoggedIn(hasToken());
    }, []);

    const onTextareChange = (event) => {
        setText(event.target.value);
    };

    const onTextareaActive = () => {
        setIsTextActive(!isTextActive);
    };

    const onFileChange = (event) => {
        // Support multi upload at a later stage
        const [file] = event.target.files;

        setFile(file);
    };

    const onPasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const onIpChange = (event) => {
        setAllowedIp(event.target.value);
    };

    const reset = () => {
        setText('');
        setSecretId('');
        setError('');
        setPassword('');
        setEncryptionKey('');
        setAllowedIp('');
        setFile('');
    };

    const onSubmit = async (event) => {
        if (!text) {
            setError('Please add a secret.');

            return;
        }

        event.preventDefault();

        formData.append('text', text);
        formData.append('password', password);
        formData.append('ttl', ttl);
        formData.append('allowedIp', allowedIp);
        formData.append('file', file);

        const json = await createSecret(formData, getToken());

        if (json.statusCode !== 201) {
            setError(json.error);

            return;
        }

        setSecretId(json.id);
        setEncryptionKey(json.key);
        setError('');
    };

    const onNewSecret = async (event) => {
        event.preventDefault();

        reset();
    };

    const onBurn = async (event) => {
        if (!secretId) {
            return;
        }

        event.preventDefault();

        burnSecret(secretId);

        reset();
    };

    const getSecretURL = () => `${window.location.href}secret/${encryptionKey}/${secretId}`;

    const inputReadOnly = !!secretId;

    return (
        <>
            <Wrapper>
                <h1 className={style.h1}>
                    Paste a password, secret message, or private information.
                </h1>
                <Info>
                    Keep your sensitive information out of chat logs, emails, and more with heavily
                    encrypted secrets.
                </Info>
                <div className={style.form}>
                    <Textarea
                        compress={secretId}
                        placeholder="Write your sensitive information.."
                        onChange={onTextareChange}
                        value={text}
                        readOnly={inputReadOnly}
                        variant={inputReadOnly ? 'filled' : ''}
                        onFocus={onTextareaActive}
                        onBlur={onTextareaActive}
                        autosize
                        minRows={6}
                        maxRows={16}
                    />

                    {!isLoggedIn && (
                        <Info align="right">You have to sign in to upload an image.</Info>
                    )}
                    {isLoggedIn && (
                        <Info align="right">Only one image is currently supported.</Info>
                    )}
                    <Input
                        placeholder="Image upload"
                        type="file"
                        onChange={onFileChange}
                        disabled={!isLoggedIn}
                    />

                    <Group position="apart" grow>
                        <Select
                            value={ttl}
                            onChange={setTTL}
                            data={[
                                { value: 604800, label: '7 days' },
                                { value: 259200, label: '3 days' },
                                { value: 86400, label: '1 day' },
                                { value: 43200, label: '12 hours' },
                                { value: 14400, label: '4 hours' },
                                { value: 3600, label: '1 hour' },
                                { value: 1800, label: '30 minutes' },
                                { value: 300, label: '5 minutes' },
                            ]}
                        />
                        <Input
                            placeholder="Your optional password"
                            value={password}
                            onChange={onPasswordChange}
                            readOnly={inputReadOnly}
                            variant={inputReadOnly ? 'filled' : ''}
                            style={{ WebkitTextSecurity: 'disc' }} // hack for password prompt
                        />
                    </Group>

                    <Expandable>
                        <Input
                            placeholder="Restrict by IP address"
                            value={allowedIp}
                            onChange={onIpChange}
                            readOnly={inputReadOnly}
                            variant={inputReadOnly ? 'filled' : ''}
                        />
                    </Expandable>

                    {secretId && (
                        <>
                            <Info align="left">
                                <Share url={getSecretURL()}></Share>
                            </Info>

                            <Input value={getSecretURL()} readOnly />
                        </>
                    )}

                    <div className={style.buttonWrapper}>
                        {!secretId && (
                            <Button color="teal" onClick={onSubmit}>
                                Create a secret link
                            </Button>
                        )}

                        {secretId && (
                            <Button color="teal" onClick={onNewSecret}>
                                Create a new secret
                            </Button>
                        )}

                        {secretId && (
                            <Button
                                color="teal"
                                variant="outline"
                                onClick={onBurn}
                                disabled={!secretId}
                            >
                                Burn the secret
                            </Button>
                        )}
                    </div>
                </div>
            </Wrapper>

            {error && <Error>{error}</Error>}

            <Info>The secret link only works once, and then it will disappear.</Info>

            <Info>
                <strong>Hemmelig</strong>, [he`m:(ə)li], means secret in Norwegian.
            </Info>
        </>
    );
};

export default Home;
