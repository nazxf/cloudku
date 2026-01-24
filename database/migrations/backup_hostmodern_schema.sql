--
-- PostgreSQL database dump
--

\restrict Fqa3dgVSpm9hWd24Jnb27RiJw0cJEgndqgmRPz6ZOXD9DHDmO7RNEYW9S9BB3mb

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth_provider; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.auth_provider AS ENUM (
    'google',
    'facebook',
    'email'
);


--
-- Name: cleanup_expired_sessions(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_expired_sessions() RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;


--
-- Name: FUNCTION cleanup_expired_sessions(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.cleanup_expired_sessions() IS 'Hapus expired sessions, jalankan via cron';


--
-- Name: cleanup_powerdns_record(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_powerdns_record() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    domain_name_var VARCHAR(255);
    record_name_var VARCHAR(255);
BEGIN
    SELECT domain_name INTO domain_name_var
    FROM domains WHERE id = OLD.domain_id;
    
    record_name_var := CASE 
        WHEN OLD.name = '@' THEN domain_name_var
        ELSE OLD.name || '.' || domain_name_var
    END;
    
    DELETE FROM pdns_records 
    WHERE name = record_name_var 
    AND type = OLD.record_type;
    
    RETURN OLD;
END;
$$;


--
-- Name: create_soa_record(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_soa_record() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    pdns_domain_id INT;
    soa_content TEXT;
BEGIN
    -- Create PowerDNS domain entry
    INSERT INTO pdns_domains (name, type, account)
    VALUES (NEW.domain_name, 'NATIVE', 'user_' || NEW.user_id)
    RETURNING id INTO pdns_domain_id;
    
    -- Create SOA record (Start of Authority)
    soa_content := 'ns1.cloudku.com hostmaster.' || NEW.domain_name || ' ' ||
                   EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT || ' ' || -- Serial
                   '10800 3600 604800 3600'; -- Refresh, Retry, Expire, Minimum TTL
    
    INSERT INTO pdns_records (domain_id, name, type, content, ttl, prio, auth)
    VALUES (pdns_domain_id, NEW.domain_name, 'SOA', soa_content, 3600, NULL, TRUE);
    
    -- Create NS records (Name Servers)
    INSERT INTO pdns_records (domain_id, name, type, content, ttl, prio, auth)
    VALUES 
        (pdns_domain_id, NEW.domain_name, 'NS', 'ns1.cloudku.com', 3600, NULL, TRUE),
        (pdns_domain_id, NEW.domain_name, 'NS', 'ns2.cloudku.com', 3600, NULL, TRUE);
    
    RETURN NEW;
END;
$$;


--
-- Name: sync_dns_to_powerdns(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_dns_to_powerdns() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    pdns_domain_id INT;
    domain_name_var VARCHAR(255);
BEGIN
    -- Get domain name from our domains table
    SELECT domain_name INTO domain_name_var
    FROM domains WHERE id = NEW.domain_id;
    
    -- Ensure PowerDNS domain exists
    INSERT INTO pdns_domains (name, type, account)
    VALUES (domain_name_var, 'NATIVE', 'cloudku')
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO pdns_domain_id;
    
    -- Insert/Update record in PowerDNS format
    INSERT INTO pdns_records (domain_id, name, type, content, ttl, prio, auth)
    VALUES (
        pdns_domain_id,
        CASE 
            WHEN NEW.name = '@' THEN domain_name_var
            ELSE NEW.name || '.' || domain_name_var
        END,
        NEW.record_type,
        NEW.value,
        NEW.ttl,
        NEW.priority,
        TRUE
    )
    ON CONFLICT (name, type) DO UPDATE 
    SET content = EXCLUDED.content,
        ttl = EXCLUDED.ttl,
        prio = EXCLUDED.prio;
    
    RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: dns_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dns_records (
    id integer NOT NULL,
    domain_id integer NOT NULL,
    record_type character varying(10) NOT NULL,
    name character varying(255) NOT NULL,
    value text NOT NULL,
    ttl integer DEFAULT 3600,
    priority integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: dns_records_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dns_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dns_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dns_records_id_seq OWNED BY public.dns_records.id;


--
-- Name: domain_aliases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.domain_aliases (
    id integer NOT NULL,
    domain_id integer NOT NULL,
    alias_name character varying(255) NOT NULL,
    document_root character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: domain_aliases_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.domain_aliases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: domain_aliases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.domain_aliases_id_seq OWNED BY public.domain_aliases.id;


--
-- Name: domains; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.domains (
    id integer NOT NULL,
    user_id integer NOT NULL,
    domain_name character varying(255) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    document_root character varying(500) DEFAULT '/public_html'::character varying,
    ssl_enabled boolean DEFAULT false,
    ssl_provider character varying(50),
    ssl_expires_at timestamp without time zone,
    auto_renew_ssl boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    verified_at timestamp without time zone,
    expires_at timestamp without time zone
);


--
-- Name: domains_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.domains_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: domains_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.domains_id_seq OWNED BY public.domains.id;


--
-- Name: email_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_accounts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    email character varying(255) NOT NULL,
    quota_mb integer DEFAULT 5120,
    used_mb integer DEFAULT 0,
    status character varying(50) DEFAULT 'active'::character varying,
    forwarders_count integer DEFAULT 0,
    autoresponder_enabled boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: email_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.email_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: email_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.email_accounts_id_seq OWNED BY public.email_accounts.id;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id integer NOT NULL,
    user_id integer NOT NULL,
    invoice_number character varying(100) NOT NULL,
    description text,
    amount numeric(10,2) NOT NULL,
    status character varying(50) DEFAULT 'paid'::character varying,
    payment_method character varying(100),
    invoice_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    due_date timestamp without time zone,
    paid_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.invoices_id_seq OWNED BY public.invoices.id;


--
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_methods (
    id integer NOT NULL,
    user_id integer NOT NULL,
    card_type character varying(50),
    last_four character varying(4) NOT NULL,
    expiry_month integer NOT NULL,
    expiry_year integer NOT NULL,
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: payment_methods_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_methods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payment_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_methods_id_seq OWNED BY public.payment_methods.id;


--
-- Name: pdns_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pdns_comments (
    id integer NOT NULL,
    domain_id integer NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(10) NOT NULL,
    modified_at integer NOT NULL,
    account character varying(40) DEFAULT NULL::character varying,
    comment text NOT NULL
);


--
-- Name: pdns_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pdns_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pdns_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pdns_comments_id_seq OWNED BY public.pdns_comments.id;


--
-- Name: pdns_cryptokeys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pdns_cryptokeys (
    id integer NOT NULL,
    domain_id integer NOT NULL,
    flags integer NOT NULL,
    active boolean,
    published boolean DEFAULT true,
    content text
);


--
-- Name: pdns_cryptokeys_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pdns_cryptokeys_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pdns_cryptokeys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pdns_cryptokeys_id_seq OWNED BY public.pdns_cryptokeys.id;


--
-- Name: pdns_domainmetadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pdns_domainmetadata (
    id integer NOT NULL,
    domain_id integer NOT NULL,
    kind character varying(32) DEFAULT NULL::character varying,
    content text
);


--
-- Name: pdns_domainmetadata_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pdns_domainmetadata_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pdns_domainmetadata_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pdns_domainmetadata_id_seq OWNED BY public.pdns_domainmetadata.id;


--
-- Name: pdns_domains; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pdns_domains (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    master character varying(128) DEFAULT NULL::character varying,
    last_check integer,
    type character varying(8) NOT NULL,
    notified_serial bigint,
    account character varying(40) DEFAULT NULL::character varying,
    options text,
    catalog character varying(255) DEFAULT NULL::character varying
);


--
-- Name: pdns_domains_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pdns_domains_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pdns_domains_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pdns_domains_id_seq OWNED BY public.pdns_domains.id;


--
-- Name: pdns_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pdns_records (
    id bigint NOT NULL,
    domain_id integer,
    name character varying(255) DEFAULT NULL::character varying,
    type character varying(10) DEFAULT NULL::character varying,
    content character varying(65535) DEFAULT NULL::character varying,
    ttl integer,
    prio integer,
    disabled boolean DEFAULT false,
    ordername character varying(255),
    auth boolean DEFAULT true
);


--
-- Name: pdns_records_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pdns_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pdns_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pdns_records_id_seq OWNED BY public.pdns_records.id;


--
-- Name: pdns_supermasters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pdns_supermasters (
    ip inet NOT NULL,
    nameserver character varying(255) NOT NULL,
    account character varying(40) NOT NULL
);


--
-- Name: pdns_tsigkeys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pdns_tsigkeys (
    id integer NOT NULL,
    name character varying(255),
    algorithm character varying(50),
    secret character varying(255)
);


--
-- Name: pdns_tsigkeys_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pdns_tsigkeys_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pdns_tsigkeys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pdns_tsigkeys_id_seq OWNED BY public.pdns_tsigkeys.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    refresh_token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ip_address character varying(45),
    user_agent text
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.sessions IS 'Tabel untuk menyimpan refresh tokens dan session management';


--
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- Name: ssl_certificates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ssl_certificates (
    id integer NOT NULL,
    domain_id integer NOT NULL,
    certificate text,
    private_key text,
    issuer character varying(255),
    issued_at timestamp without time zone,
    expires_at timestamp without time zone,
    auto_renew boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: ssl_certificates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ssl_certificates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ssl_certificates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ssl_certificates_id_seq OWNED BY public.ssl_certificates.id;


--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_tickets (
    id integer NOT NULL,
    user_id integer NOT NULL,
    ticket_number character varying(100) NOT NULL,
    subject character varying(500) NOT NULL,
    message text,
    status character varying(50) DEFAULT 'open'::character varying,
    priority character varying(50) DEFAULT 'medium'::character varying,
    assigned_to character varying(255),
    last_update timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: support_tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.support_tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: support_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.support_tickets_id_seq OWNED BY public.support_tickets.id;


--
-- Name: user_databases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_databases (
    id integer NOT NULL,
    user_id integer NOT NULL,
    database_name character varying(255) NOT NULL,
    database_type character varying(50) DEFAULT 'mysql'::character varying,
    size_mb numeric(10,2) DEFAULT 0,
    tables_count integer DEFAULT 0,
    users_count integer DEFAULT 1,
    status character varying(50) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_user character varying(255),
    charset character varying(50) DEFAULT 'utf8mb4'::character varying,
    "collation" character varying(100) DEFAULT 'utf8mb4_unicode_ci'::character varying,
    db_password character varying(255)
);


--
-- Name: user_databases_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_databases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_databases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_databases_id_seq OWNED BY public.user_databases.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    password_hash character varying(255),
    profile_picture text,
    auth_provider character varying(255) DEFAULT 'email'::public.auth_provider NOT NULL,
    google_id character varying(255),
    facebook_id character varying(255),
    email_verified boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone,
    github_id character varying(255),
    db_prefix character varying(10)
);


--
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.users IS 'Tabel untuk menyimpan data pengguna dari berbagai auth provider';


--
-- Name: COLUMN users.password_hash; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.password_hash IS 'bcrypt hash, NULL untuk OAuth users';


--
-- Name: COLUMN users.google_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.google_id IS 'Google User ID (sub) dari JWT token Google OAuth';


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: v_dns_records; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_dns_records AS
 SELECT d.domain_name,
    dr.name AS record_name,
    dr.record_type,
    dr.value AS content,
    dr.ttl,
    dr.priority,
    dr.created_at
   FROM (public.dns_records dr
     JOIN public.domains d ON ((dr.domain_id = d.id)))
  ORDER BY d.domain_name, dr.record_type, dr.name;


--
-- Name: v_powerdns_records; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_powerdns_records AS
 SELECT pd.name AS domain,
    pr.name AS fqdn,
    pr.type,
    pr.content,
    pr.ttl,
    pr.prio AS priority,
    pr.disabled
   FROM (public.pdns_records pr
     JOIN public.pdns_domains pd ON ((pr.domain_id = pd.id)))
  ORDER BY pd.name, pr.type, pr.name;


--
-- Name: websites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.websites (
    id integer NOT NULL,
    user_id integer NOT NULL,
    domain character varying(255) NOT NULL,
    status character varying(50) DEFAULT 'active'::character varying,
    plan character varying(100) DEFAULT 'premium'::character varying,
    visitors_count integer DEFAULT 0,
    storage_used bigint DEFAULT 0,
    bandwidth_used bigint DEFAULT 0,
    uptime_percentage numeric(5,2) DEFAULT 99.9,
    ssl_enabled boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: websites_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.websites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: websites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.websites_id_seq OWNED BY public.websites.id;


--
-- Name: dns_records id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dns_records ALTER COLUMN id SET DEFAULT nextval('public.dns_records_id_seq'::regclass);


--
-- Name: domain_aliases id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domain_aliases ALTER COLUMN id SET DEFAULT nextval('public.domain_aliases_id_seq'::regclass);


--
-- Name: domains id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domains ALTER COLUMN id SET DEFAULT nextval('public.domains_id_seq'::regclass);


--
-- Name: email_accounts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_accounts ALTER COLUMN id SET DEFAULT nextval('public.email_accounts_id_seq'::regclass);


--
-- Name: invoices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices ALTER COLUMN id SET DEFAULT nextval('public.invoices_id_seq'::regclass);


--
-- Name: payment_methods id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods ALTER COLUMN id SET DEFAULT nextval('public.payment_methods_id_seq'::regclass);


--
-- Name: pdns_comments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pdns_comments ALTER COLUMN id SET DEFAULT nextval('public.pdns_comments_id_seq'::regclass);


--
-- Name: pdns_cryptokeys id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pdns_cryptokeys ALTER COLUMN id SET DEFAULT nextval('public.pdns_cryptokeys_id_seq'::regclass);


--
-- Name: pdns_domainmetadata id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pdns_domainmetadata ALTER COLUMN id SET DEFAULT nextval('public.pdns_domainmetadata_id_seq'::regclass);


--
-- Name: pdns_domains id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pdns_domains ALTER COLUMN id SET DEFAULT nextval('public.pdns_domains_id_seq'::regclass);


--
-- Name: pdns_records id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pdns_records ALTER COLUMN id SET DEFAULT nextval('public.pdns_records_id_seq'::regclass);


--
-- Name: pdns_tsigkeys id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pdns_tsigkeys ALTER COLUMN id SET DEFAULT nextval('public.pdns_tsigkeys_id_seq'::regclass);


--
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- Name: ssl_certificates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ssl_certificates ALTER COLUMN id SET DEFAULT nextval('public.ssl_certificates_id_seq'::regclass);


--
-- Name: support_tickets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets ALTER COLUMN id SET DEFAULT nextval('public.support_tickets_id_seq'::regclass);


--
-- Name: user_databases id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_databases ALTER COLUMN id SET DEFAULT nextval('public.user_databases_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: websites id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.websites ALTER COLUMN id SET DEFAULT nextval('public.websites_id_seq'::regclass);


--
-- Name: dns_records dns_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dns_records
    ADD CONSTRAINT dns_records_pkey PRIMARY KEY (id);


--
-- Name: domain_aliases domain_aliases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domain_aliases
    ADD CONSTRAINT domain_aliases_pkey PRIMARY KEY (id);


--
-- Name: domains domains_domain_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domains
    ADD CONSTRAINT domains_domain_name_key UNIQUE (domain_name);


--
-- Name: domains domains_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domains
    ADD CONSTRAINT domains_pkey PRIMARY KEY (id);


--
-- Name: email_accounts email_accounts_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_accounts
    ADD CONSTRAINT email_accounts_email_key UNIQUE (email);


--
-- Name: email_accounts email_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_accounts
    ADD CONSTRAINT email_accounts_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- Name: pdns_comments pdns_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pdns_comments
    ADD CONSTRAINT pdns_comments_pkey PRIMARY KEY (id);


--
-- Name: pdns_cryptokeys pdns_cryptokeys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pdns_cryptokeys
    ADD CONSTRAINT pdns_cryptokeys_pkey PRIMARY KEY (id);


--
-- Name: pdns_domainmetadata pdns_domainmetadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pdns_domainmetadata
    ADD CONSTRAINT pdns_domainmetadata_pkey PRIMARY KEY (id);


--
-- Name: pdns_domains pdns_domains_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pdns_domains
    ADD CONSTRAINT pdns_domains_name_key UNIQUE (name);


--
-- Name: pdns_domains pdns_domains_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pdns_domains
    ADD CONSTRAINT pdns_domains_pkey PRIMARY KEY (id);


--
-- Name: pdns_records pdns_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pdns_records
    ADD CONSTRAINT pdns_records_pkey PRIMARY KEY (id);


--
-- Name: pdns_supermasters pdns_supermasters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pdns_supermasters
    ADD CONSTRAINT pdns_supermasters_pkey PRIMARY KEY (ip, nameserver);


--
-- Name: pdns_tsigkeys pdns_tsigkeys_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pdns_tsigkeys
    ADD CONSTRAINT pdns_tsigkeys_name_key UNIQUE (name);


--
-- Name: pdns_tsigkeys pdns_tsigkeys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pdns_tsigkeys
    ADD CONSTRAINT pdns_tsigkeys_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_refresh_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_refresh_token_key UNIQUE (refresh_token);


--
-- Name: ssl_certificates ssl_certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ssl_certificates
    ADD CONSTRAINT ssl_certificates_pkey PRIMARY KEY (id);


--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- Name: support_tickets support_tickets_ticket_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_ticket_number_key UNIQUE (ticket_number);


--
-- Name: user_databases user_databases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_databases
    ADD CONSTRAINT user_databases_pkey PRIMARY KEY (id);


--
-- Name: user_databases user_databases_user_id_database_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_databases
    ADD CONSTRAINT user_databases_user_id_database_name_key UNIQUE (user_id, database_name);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_facebook_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_facebook_id_key UNIQUE (facebook_id);


--
-- Name: users users_github_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_github_id_key UNIQUE (github_id);


--
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: websites websites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.websites
    ADD CONSTRAINT websites_pkey PRIMARY KEY (id);


--
-- Name: idx_dns_records_domain_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dns_records_domain_id ON public.dns_records USING btree (domain_id);


--
-- Name: idx_domain_aliases_domain_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_domain_aliases_domain_id ON public.domain_aliases USING btree (domain_id);


--
-- Name: idx_domains_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_domains_status ON public.domains USING btree (status);


--
-- Name: idx_domains_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_domains_user_id ON public.domains USING btree (user_id);


--
-- Name: idx_email_accounts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_accounts_user_id ON public.email_accounts USING btree (user_id);


--
-- Name: idx_invoices_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_user_id ON public.invoices USING btree (user_id);


--
-- Name: idx_payment_methods_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_methods_user_id ON public.payment_methods USING btree (user_id);


--
-- Name: idx_sessions_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_expires_at ON public.sessions USING btree (expires_at);


--
-- Name: idx_sessions_refresh_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_refresh_token ON public.sessions USING btree (refresh_token);


--
-- Name: idx_sessions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_user_id ON public.sessions USING btree (user_id);


--
-- Name: idx_ssl_certificates_domain_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ssl_certificates_domain_id ON public.ssl_certificates USING btree (domain_id);


--
-- Name: idx_support_tickets_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_tickets_user_id ON public.support_tickets USING btree (user_id);


--
-- Name: idx_user_databases_database_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_databases_database_user ON public.user_databases USING btree (database_user);


--
-- Name: idx_user_databases_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_databases_user_id ON public.user_databases USING btree (user_id);


--
-- Name: idx_users_db_prefix; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_db_prefix ON public.users USING btree (db_prefix);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_facebook_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_facebook_id ON public.users USING btree (facebook_id);


--
-- Name: idx_users_google_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_google_id ON public.users USING btree (google_id);


--
-- Name: idx_websites_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_websites_user_id ON public.websites USING btree (user_id);


--
-- Name: pdns_account_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pdns_account_index ON public.pdns_domains USING btree (account);


--
-- Name: pdns_comments_domain_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pdns_comments_domain_id_idx ON public.pdns_comments USING btree (domain_id);


--
-- Name: pdns_comments_name_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pdns_comments_name_type_idx ON public.pdns_comments USING btree (name, type);


--
-- Name: pdns_comments_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pdns_comments_order_idx ON public.pdns_comments USING btree (domain_id, modified_at);


--
-- Name: pdns_cryptokeys_domain_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pdns_cryptokeys_domain_id_idx ON public.pdns_cryptokeys USING btree (domain_id);


--
-- Name: pdns_domain_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pdns_domain_id_index ON public.pdns_records USING btree (domain_id);


--
-- Name: pdns_domainmetadata_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pdns_domainmetadata_idx ON public.pdns_domainmetadata USING btree (domain_id, kind);


--
-- Name: pdns_name_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pdns_name_index ON public.pdns_domains USING btree (name);


--
-- Name: pdns_nametype_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pdns_nametype_index ON public.pdns_records USING btree (name, type);


--
-- Name: pdns_orderindex; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pdns_orderindex ON public.pdns_records USING btree (ordername);


--
-- Name: pdns_rec_name_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pdns_rec_name_index ON public.pdns_records USING btree (name);


--
-- Name: pdns_tsigkeys_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pdns_tsigkeys_name_idx ON public.pdns_tsigkeys USING btree (name);


--
-- Name: domains create_domain_soa; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER create_domain_soa AFTER INSERT ON public.domains FOR EACH ROW EXECUTE FUNCTION public.create_soa_record();


--
-- Name: dns_records dns_cleanup_powerdns; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER dns_cleanup_powerdns AFTER DELETE ON public.dns_records FOR EACH ROW EXECUTE FUNCTION public.cleanup_powerdns_record();


--
-- Name: dns_records dns_to_powerdns_sync; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER dns_to_powerdns_sync AFTER INSERT OR UPDATE ON public.dns_records FOR EACH ROW EXECUTE FUNCTION public.sync_dns_to_powerdns();


--
-- Name: dns_records update_dns_records_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_dns_records_updated_at BEFORE UPDATE ON public.dns_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: domains update_domains_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON public.domains FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: email_accounts update_email_accounts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_email_accounts_updated_at BEFORE UPDATE ON public.email_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: invoices update_invoices_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: payment_methods update_payment_methods_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON public.payment_methods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ssl_certificates update_ssl_certificates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ssl_certificates_updated_at BEFORE UPDATE ON public.ssl_certificates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: support_tickets update_support_tickets_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_databases update_user_databases_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_databases_updated_at BEFORE UPDATE ON public.user_databases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: websites update_websites_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_websites_updated_at BEFORE UPDATE ON public.websites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: dns_records dns_records_domain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dns_records
    ADD CONSTRAINT dns_records_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES public.domains(id) ON DELETE CASCADE;


--
-- Name: domain_aliases domain_aliases_domain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domain_aliases
    ADD CONSTRAINT domain_aliases_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES public.domains(id) ON DELETE CASCADE;


--
-- Name: domains domains_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domains
    ADD CONSTRAINT domains_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: email_accounts email_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_accounts
    ADD CONSTRAINT email_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payment_methods payment_methods_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: pdns_comments pdns_comments_domain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pdns_comments
    ADD CONSTRAINT pdns_comments_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES public.pdns_domains(id) ON DELETE CASCADE;


--
-- Name: pdns_cryptokeys pdns_cryptokeys_domain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pdns_cryptokeys
    ADD CONSTRAINT pdns_cryptokeys_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES public.pdns_domains(id) ON DELETE CASCADE;


--
-- Name: pdns_domainmetadata pdns_domainmetadata_domain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pdns_domainmetadata
    ADD CONSTRAINT pdns_domainmetadata_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES public.pdns_domains(id) ON DELETE CASCADE;


--
-- Name: pdns_records pdns_records_domain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pdns_records
    ADD CONSTRAINT pdns_records_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES public.pdns_domains(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ssl_certificates ssl_certificates_domain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ssl_certificates
    ADD CONSTRAINT ssl_certificates_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES public.domains(id) ON DELETE CASCADE;


--
-- Name: support_tickets support_tickets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_databases user_databases_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_databases
    ADD CONSTRAINT user_databases_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: websites websites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.websites
    ADD CONSTRAINT websites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Fqa3dgVSpm9hWd24Jnb27RiJw0cJEgndqgmRPz6ZOXD9DHDmO7RNEYW9S9BB3mb

