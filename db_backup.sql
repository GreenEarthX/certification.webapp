--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4 (Ubuntu 17.4-1.pgdg22.04+2)

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
-- Name: aiven_extras; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA aiven_extras;


ALTER SCHEMA aiven_extras OWNER TO postgres;

--
-- Name: aiven_extras; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS aiven_extras WITH SCHEMA aiven_extras;


--
-- Name: EXTENSION aiven_extras; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION aiven_extras IS 'aiven_extras';


--
-- Name: alert_severities; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.alert_severities AS ENUM (
    'High',
    'Medium',
    'Low'
);


ALTER TYPE public.alert_severities OWNER TO avnadmin;

--
-- Name: alert_types; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.alert_types AS ENUM (
    'Certification',
    'Document',
    'Info'
);


ALTER TYPE public.alert_types OWNER TO avnadmin;

--
-- Name: certificate_type_enum; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.certificate_type_enum AS ENUM (
    'Sustainability Certificate',
    'EAC'
);


ALTER TYPE public.certificate_type_enum OWNER TO avnadmin;

--
-- Name: certification_status; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.certification_status AS ENUM (
    'Active',
    'Expiring',
    'Expired'
);


ALTER TYPE public.certification_status OWNER TO avnadmin;

--
-- Name: framework_enum; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.framework_enum AS ENUM (
    'Regulatory',
    'Voluntary'
);


ALTER TYPE public.framework_enum OWNER TO avnadmin;

--
-- Name: geographic_coverage_enum; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.geographic_coverage_enum AS ENUM (
    'National',
    'Regional',
    'Global'
);


ALTER TYPE public.geographic_coverage_enum OWNER TO avnadmin;

--
-- Name: role_enum; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.role_enum AS ENUM (
    'Plant Operator',
    'Platform Admin',
    'Compliance Team',
    'Certification Body Agent'
);


ALTER TYPE public.role_enum OWNER TO avnadmin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accreditation_bodies; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.accreditation_bodies (
    ab_id integer NOT NULL,
    ab_name character varying(255) NOT NULL
);


ALTER TABLE public.accreditation_bodies OWNER TO avnadmin;

--
-- Name: accreditation_bodies_ab_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.accreditation_bodies_ab_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accreditation_bodies_ab_id_seq OWNER TO avnadmin;

--
-- Name: accreditation_bodies_ab_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.accreditation_bodies_ab_id_seq OWNED BY public.accreditation_bodies.ab_id;


--
-- Name: address; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.address (
    address_id integer NOT NULL,
    street character varying(255),
    city character varying(255),
    state character varying(255),
    postal_code character varying(20),
    country character varying(255),
    region character varying(255)
);


ALTER TABLE public.address OWNER TO avnadmin;

--
-- Name: address_address_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.address_address_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.address_address_id_seq OWNER TO avnadmin;

--
-- Name: address_address_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.address_address_id_seq OWNED BY public.address.address_id;


--
-- Name: alert_recipients; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.alert_recipients (
    alert_id integer NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.alert_recipients OWNER TO avnadmin;

--
-- Name: alerts; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.alerts (
    alert_id integer NOT NULL,
    alert_title character varying(100) NOT NULL,
    alert_type public.alert_types,
    issuer_id integer,
    fuel_id integer,
    region_id integer,
    alert_description text,
    alert_severity public.alert_severities,
    "timestamp" timestamp without time zone
);


ALTER TABLE public.alerts OWNER TO avnadmin;

--
-- Name: alerts_alert_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.alerts_alert_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alerts_alert_id_seq OWNER TO avnadmin;

--
-- Name: alerts_alert_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.alerts_alert_id_seq OWNED BY public.alerts.alert_id;


--
-- Name: certification_bodies; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.certification_bodies (
    cb_id integer NOT NULL,
    cb_name character varying(255) NOT NULL
);


ALTER TABLE public.certification_bodies OWNER TO avnadmin;

--
-- Name: certification_bodies_cb_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.certification_bodies_cb_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.certification_bodies_cb_id_seq OWNER TO avnadmin;

--
-- Name: certification_bodies_cb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.certification_bodies_cb_id_seq OWNED BY public.certification_bodies.cb_id;


--
-- Name: certification_scheme_holders; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.certification_scheme_holders (
    csh_id integer NOT NULL,
    csh_name character varying(255) NOT NULL
);


ALTER TABLE public.certification_scheme_holders OWNER TO avnadmin;

--
-- Name: certification_scheme_holders_csh_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.certification_scheme_holders_csh_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.certification_scheme_holders_csh_id_seq OWNER TO avnadmin;

--
-- Name: certification_scheme_holders_csh_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.certification_scheme_holders_csh_id_seq OWNED BY public.certification_scheme_holders.csh_id;


--
-- Name: certification_schemes; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.certification_schemes (
    certification_scheme_id integer NOT NULL,
    certification_scheme_name character varying(255) NOT NULL,
    framework public.framework_enum,
    certificate_type public.certificate_type_enum,
    geographic_coverage public.geographic_coverage_enum,
    accreditation_body_id integer,
    issuing_body_id integer,
    address_id integer,
    overview jsonb,
    validity character varying,
    CONSTRAINT check_json_keys CHECK (((overview ? 'overview'::text) AND (overview ? 'requirements'::text) AND (overview ? 'process'::text) AND (overview ? 'short_certification_overview'::text) AND (overview ? 'recommendation_overview'::text) AND (overview ? 'track_process'::text))),
    CONSTRAINT check_json_types CHECK (((jsonb_typeof((overview -> 'overview'::text)) = 'object'::text) AND (jsonb_typeof((overview -> 'requirements'::text)) = 'object'::text) AND (jsonb_typeof((overview -> 'process'::text)) = 'object'::text) AND (jsonb_typeof((overview -> 'short_certification_overview'::text)) = 'string'::text) AND (jsonb_typeof((overview -> 'recommendation_overview'::text)) = 'object'::text) AND (jsonb_typeof((overview -> 'track_process'::text)) = 'object'::text) AND (jsonb_typeof(((overview -> 'overview'::text) -> 'description'::text)) = 'string'::text) AND (jsonb_typeof(((overview -> 'overview'::text) -> 'ensure'::text)) = 'object'::text) AND (jsonb_typeof((((overview -> 'overview'::text) -> 'ensure'::text) -> 'title'::text)) = 'string'::text) AND (jsonb_typeof((((overview -> 'overview'::text) -> 'ensure'::text) -> 'list'::text)) = 'array'::text) AND (jsonb_typeof(((overview -> 'overview'::text) -> 'types'::text)) = 'object'::text) AND (jsonb_typeof((((overview -> 'overview'::text) -> 'types'::text) -> 'title'::text)) = 'string'::text) AND (jsonb_typeof((((overview -> 'overview'::text) -> 'types'::text) -> 'types'::text)) = 'array'::text) AND (jsonb_typeof((((((overview -> 'overview'::text) -> 'types'::text) -> 'types'::text) -> 0) -> 'type_title'::text)) = 'string'::text) AND (jsonb_typeof((((((overview -> 'overview'::text) -> 'types'::text) -> 'types'::text) -> 0) -> 'details'::text)) = 'array'::text) AND (jsonb_typeof(((overview -> 'requirements'::text) -> 'description'::text)) = 'string'::text) AND (jsonb_typeof(((overview -> 'requirements'::text) -> 'criteria'::text)) = 'object'::text) AND (jsonb_typeof((((overview -> 'requirements'::text) -> 'criteria'::text) -> 'title'::text)) = 'string'::text) AND (jsonb_typeof((((overview -> 'requirements'::text) -> 'criteria'::text) -> 'criteria_list'::text)) = 'array'::text) AND (jsonb_typeof((((((overview -> 'requirements'::text) -> 'criteria'::text) -> 'criteria_list'::text) -> 0) -> 'criterion_title'::text)) = 'string'::text) AND (jsonb_typeof((((((overview -> 'requirements'::text) -> 'criteria'::text) -> 'criteria_list'::text) -> 0) -> 'details'::text)) = 'array'::text) AND (jsonb_typeof(((overview -> 'requirements'::text) -> 'specific_green'::text)) = 'object'::text) AND (jsonb_typeof((((overview -> 'requirements'::text) -> 'specific_green'::text) -> 'title'::text)) = 'string'::text) AND (jsonb_typeof((((overview -> 'requirements'::text) -> 'specific_green'::text) -> 'description'::text)) = 'string'::text) AND (jsonb_typeof((((overview -> 'requirements'::text) -> 'specific_green'::text) -> 'list'::text)) = 'array'::text) AND (jsonb_typeof(((overview -> 'requirements'::text) -> 'specific_low'::text)) = 'object'::text) AND (jsonb_typeof((((overview -> 'requirements'::text) -> 'specific_low'::text) -> 'title'::text)) = 'string'::text) AND (jsonb_typeof((((overview -> 'requirements'::text) -> 'specific_low'::text) -> 'description'::text)) = 'string'::text) AND (jsonb_typeof((((overview -> 'requirements'::text) -> 'specific_low'::text) -> 'list'::text)) = 'array'::text) AND (jsonb_typeof(((overview -> 'process'::text) -> 'steps'::text)) = 'array'::text) AND (jsonb_typeof(((((overview -> 'track_process'::text) -> 'tasks'::text) -> 0) -> 'task_title'::text)) = 'string'::text) AND (jsonb_typeof(((((overview -> 'track_process'::text) -> 'tasks'::text) -> 0) -> 'sub_task'::text)) = 'array'::text) AND (jsonb_typeof(((overview -> 'recommendation_overview'::text) -> 'description'::text)) = 'string'::text) AND (jsonb_typeof(((overview -> 'recommendation_overview'::text) -> 'features'::text)) = 'array'::text) AND (jsonb_typeof(((overview -> 'track_process'::text) -> 'tasks'::text)) = 'array'::text) AND (jsonb_typeof(((((overview -> 'track_process'::text) -> 'tasks'::text) -> 0) -> 'task_title'::text)) = 'string'::text) AND (jsonb_typeof(((((overview -> 'track_process'::text) -> 'tasks'::text) -> 0) -> 'sub_task'::text)) = 'array'::text)))
);


ALTER TABLE public.certification_schemes OWNER TO avnadmin;

--
-- Name: certification_schemes_certification_bodies; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.certification_schemes_certification_bodies (
    certification_scheme_id integer NOT NULL,
    cb_id integer NOT NULL
);


ALTER TABLE public.certification_schemes_certification_bodies OWNER TO avnadmin;

--
-- Name: certification_schemes_certification_scheme_holders; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.certification_schemes_certification_scheme_holders (
    certification_scheme_id integer NOT NULL,
    csh_id integer NOT NULL
);


ALTER TABLE public.certification_schemes_certification_scheme_holders OWNER TO avnadmin;

--
-- Name: certification_schemes_certification_scheme_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.certification_schemes_certification_scheme_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.certification_schemes_certification_scheme_id_seq OWNER TO avnadmin;

--
-- Name: certification_schemes_certification_scheme_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.certification_schemes_certification_scheme_id_seq OWNED BY public.certification_schemes.certification_scheme_id;


--
-- Name: certification_schemes_fuel_types; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.certification_schemes_fuel_types (
    certification_scheme_id integer NOT NULL,
    fuel_id integer NOT NULL
);


ALTER TABLE public.certification_schemes_fuel_types OWNER TO avnadmin;

--
-- Name: certification_schemes_legislation_compliances; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.certification_schemes_legislation_compliances (
    certification_scheme_id integer NOT NULL,
    lc_id integer NOT NULL
);


ALTER TABLE public.certification_schemes_legislation_compliances OWNER TO avnadmin;

--
-- Name: certifications; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.certifications (
    certification_id integer NOT NULL,
    plant_id integer,
    certification_scheme_id integer,
    ib_id integer,
    status public.certification_status,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.certifications OWNER TO avnadmin;

--
-- Name: certifications_certification_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.certifications_certification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.certifications_certification_id_seq OWNER TO avnadmin;

--
-- Name: certifications_certification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.certifications_certification_id_seq OWNED BY public.certifications.certification_id;


--
-- Name: certifications_documents; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.certifications_documents (
    certification_id integer NOT NULL,
    document_id integer NOT NULL
);


ALTER TABLE public.certifications_documents OWNER TO avnadmin;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.documents (
    document_id integer NOT NULL,
    plant_id integer,
    document_urn text NOT NULL,
    upload_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.documents OWNER TO avnadmin;

--
-- Name: documents_document_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.documents_document_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.documents_document_id_seq OWNER TO avnadmin;

--
-- Name: documents_document_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.documents_document_id_seq OWNED BY public.documents.document_id;


--
-- Name: fuel_types; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.fuel_types (
    fuel_id integer NOT NULL,
    fuel_name character varying(255) NOT NULL,
    fuel_full_name character varying(255)
);


ALTER TABLE public.fuel_types OWNER TO avnadmin;

--
-- Name: fuel_types_fuel_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.fuel_types_fuel_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fuel_types_fuel_id_seq OWNER TO avnadmin;

--
-- Name: fuel_types_fuel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.fuel_types_fuel_id_seq OWNED BY public.fuel_types.fuel_id;


--
-- Name: issuing_bodies; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.issuing_bodies (
    ib_id integer NOT NULL,
    ib_name character varying(255) NOT NULL
);


ALTER TABLE public.issuing_bodies OWNER TO avnadmin;

--
-- Name: issuing_bodies_ib_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.issuing_bodies_ib_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.issuing_bodies_ib_id_seq OWNER TO avnadmin;

--
-- Name: issuing_bodies_ib_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.issuing_bodies_ib_id_seq OWNED BY public.issuing_bodies.ib_id;


--
-- Name: legislation_compliances; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.legislation_compliances (
    lc_id integer NOT NULL,
    lc_name character varying(255) NOT NULL
);


ALTER TABLE public.legislation_compliances OWNER TO avnadmin;

--
-- Name: legislation_compliances_lc_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.legislation_compliances_lc_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.legislation_compliances_lc_id_seq OWNER TO avnadmin;

--
-- Name: legislation_compliances_lc_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.legislation_compliances_lc_id_seq OWNED BY public.legislation_compliances.lc_id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    type character varying(255) NOT NULL,
    message text NOT NULL,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    read boolean DEFAULT false NOT NULL
);


ALTER TABLE public.notifications OWNER TO avnadmin;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO avnadmin;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: plant_stages; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.plant_stages (
    stage_id integer NOT NULL,
    stage_name character varying(255) NOT NULL
);


ALTER TABLE public.plant_stages OWNER TO avnadmin;

--
-- Name: plant_stages_stage_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.plant_stages_stage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plant_stages_stage_id_seq OWNER TO avnadmin;

--
-- Name: plant_stages_stage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.plant_stages_stage_id_seq OWNED BY public.plant_stages.stage_id;


--
-- Name: plants; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.plants (
    plant_id integer NOT NULL,
    plant_name character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    operator_id integer,
    address_id integer,
    fuel_id integer,
    stage_id integer
);


ALTER TABLE public.plants OWNER TO avnadmin;

--
-- Name: plants_plant_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.plants_plant_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plants_plant_id_seq OWNER TO avnadmin;

--
-- Name: plants_plant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.plants_plant_id_seq OWNED BY public.plants.plant_id;


--
-- Name: recommendations; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.recommendations (
    recommendation_id integer NOT NULL,
    plant_id integer,
    certification_scheme_id integer,
    compliance_score integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    overview jsonb,
    CONSTRAINT check_overview_features_array CHECK ((jsonb_typeof((overview -> 'features'::text)) = 'array'::text)),
    CONSTRAINT check_overview_format CHECK (((overview ? 'title'::text) AND (overview ? 'description'::text) AND (overview ? 'features'::text) AND (overview ? 'certification_entity'::text) AND (overview ? 'validity_months'::text)))
);


ALTER TABLE public.recommendations OWNER TO avnadmin;

--
-- Name: recommendations_recommendation_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.recommendations_recommendation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recommendations_recommendation_id_seq OWNER TO avnadmin;

--
-- Name: recommendations_recommendation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.recommendations_recommendation_id_seq OWNED BY public.recommendations.recommendation_id;


--
-- Name: risk_profiles; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.risk_profiles (
    risk_profile_id integer NOT NULL,
    plant_id integer,
    risk_score smallint NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.risk_profiles OWNER TO avnadmin;

--
-- Name: risk_profiles_risk_profile_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.risk_profiles_risk_profile_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.risk_profiles_risk_profile_id_seq OWNER TO avnadmin;

--
-- Name: risk_profiles_risk_profile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.risk_profiles_risk_profile_id_seq OWNED BY public.risk_profiles.risk_profile_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    phone_number character(10),
    address_id integer,
    user_role public.role_enum,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "position" character varying(50)
);


ALTER TABLE public.users OWNER TO avnadmin;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO avnadmin;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: accreditation_bodies ab_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.accreditation_bodies ALTER COLUMN ab_id SET DEFAULT nextval('public.accreditation_bodies_ab_id_seq'::regclass);


--
-- Name: address address_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.address ALTER COLUMN address_id SET DEFAULT nextval('public.address_address_id_seq'::regclass);


--
-- Name: alerts alert_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.alerts ALTER COLUMN alert_id SET DEFAULT nextval('public.alerts_alert_id_seq'::regclass);


--
-- Name: certification_bodies cb_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certification_bodies ALTER COLUMN cb_id SET DEFAULT nextval('public.certification_bodies_cb_id_seq'::regclass);


--
-- Name: certification_scheme_holders csh_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certification_scheme_holders ALTER COLUMN csh_id SET DEFAULT nextval('public.certification_scheme_holders_csh_id_seq'::regclass);


--
-- Name: certification_schemes certification_scheme_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certification_schemes ALTER COLUMN certification_scheme_id SET DEFAULT nextval('public.certification_schemes_certification_scheme_id_seq'::regclass);


--
-- Name: certifications certification_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certifications ALTER COLUMN certification_id SET DEFAULT nextval('public.certifications_certification_id_seq'::regclass);


--
-- Name: documents document_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.documents ALTER COLUMN document_id SET DEFAULT nextval('public.documents_document_id_seq'::regclass);


--
-- Name: fuel_types fuel_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.fuel_types ALTER COLUMN fuel_id SET DEFAULT nextval('public.fuel_types_fuel_id_seq'::regclass);


--
-- Name: issuing_bodies ib_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.issuing_bodies ALTER COLUMN ib_id SET DEFAULT nextval('public.issuing_bodies_ib_id_seq'::regclass);


--
-- Name: legislation_compliances lc_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.legislation_compliances ALTER COLUMN lc_id SET DEFAULT nextval('public.legislation_compliances_lc_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: plant_stages stage_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.plant_stages ALTER COLUMN stage_id SET DEFAULT nextval('public.plant_stages_stage_id_seq'::regclass);


--
-- Name: plants plant_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.plants ALTER COLUMN plant_id SET DEFAULT nextval('public.plants_plant_id_seq'::regclass);


--
-- Name: recommendations recommendation_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.recommendations ALTER COLUMN recommendation_id SET DEFAULT nextval('public.recommendations_recommendation_id_seq'::regclass);


--
-- Name: risk_profiles risk_profile_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.risk_profiles ALTER COLUMN risk_profile_id SET DEFAULT nextval('public.risk_profiles_risk_profile_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: accreditation_bodies; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.accreditation_bodies (ab_id, ab_name) FROM stdin;
1	DAkkS
2	TBD
3	COFRAC
4	ASI
5	Various
6	UKAS
7	DANAK
8	SWEDAC
9	RvA
10	PCA
\.


--
-- Data for Name: address; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.address (address_id, street, city, state, postal_code, country, region) FROM stdin;
1	\N	\N	\N	\N	France	EU
2	\N	\N	\N	\N	UK	EU
3	\N	\N	\N	\N	Germany	EU
4	\N	\N	\N	\N	Netherlands	EU
5	\N	\N	\N	\N	Denmark	EU
6	\N	\N	\N	\N	Sweden	EU
7	\N	\N	\N	\N	Austria	EU
8	\N	\N	\N	\N	Poland	EU
9	\N	\N	\N	\N	\N	EU
\.


--
-- Data for Name: alert_recipients; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.alert_recipients (alert_id, user_id) FROM stdin;
\.


--
-- Data for Name: alerts; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.alerts (alert_id, alert_title, alert_type, issuer_id, fuel_id, region_id, alert_description, alert_severity, "timestamp") FROM stdin;
1	Expiration	Certification	1	1	1	CertifyH™ Scheme expires in 2 days	High	2025-03-11 00:00:00
2	Regulation	Certification	1	1	1	New regulation update available	Medium	2025-03-11 00:00:00
3	Audit	Document	1	1	1	New audit report uploaded for your facility	Low	2025-03-11 00:00:00
4	Info	Info	1	1	1	Expiration 	High	2025-03-12 10:11:22
\.


--
-- Data for Name: certification_bodies; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.certification_bodies (cb_id, cb_name) FROM stdin;
1	ISCC System GmbH
2	ISCC PLUS
3	REDcert
4	TÜV Rheinland
5	CertifHy
6	Bureau Veritas
7	DNV
8	2BS Consortium
9	RSB EU RED
10	European Commission (via Member States)
11	French Ministry of Ecological Transition
12	UK Department for Transport
13	EKOenergy Network
14	CertifHy (for hydrogen)
15	ERGaR (for biogas)
16	Various accredited bodies (ISCC, RSB, etc.)
17	WRI & Accredited Bodies
18	H2Global Foundation
19	SGGC Certifiers
20	Carbon Trust
21	PosHYdon
22	AIB
23	AACS
24	Better Biomass
25	Bonsucro EU
26	KZR
27	INiG
28	PEFC
29	Red Tractor
30	SQC
31	SBP
32	SURE
33	TASCC
34	UFAS
35	National Authorities
36	ISCC EU
37	Rheinland Certification Body
38	EU ETS Certification Bodies
39	REDcert Certification Body
\.


--
-- Data for Name: certification_scheme_holders; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.certification_scheme_holders (csh_id, csh_name) FROM stdin;
1	ISCC System GmbH
2	REDcert GmbH
3	CertifHy
4	2BS Consortium
5	RSB
6	Various
7	European Commission
8	Ministry of Ecological Transition
9	Department for Transport
10	Finnish Association for Nature Conservation
11	AIB
12	ICAO
13	WRI/WBCSD
14	H2Global Foundation
15	Carbon Trust
16	PosHYdon Consortium
17	Energinet
18	Swedish Energy Agency
19	Agrarmarkt Austria
20	NEN
21	Bonsucro
22	INiG
23	PEFC
\.


--
-- Data for Name: certification_schemes; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.certification_schemes (certification_scheme_id, certification_scheme_name, framework, certificate_type, geographic_coverage, accreditation_body_id, issuing_body_id, address_id, overview, validity) FROM stdin;
16	GHG Protocol Certification	Voluntary	\N	Global	\N	23	\N	\N	\N
11	French Low Carbon Label	Regulatory	Sustainability Certificate	National	3	30	1	\N	\N
12	UK RTFO	Regulatory	Sustainability Certificate	National	6	31	2	\N	\N
30	Red Tractor Farm Assurance Combinable Crops & Sugar Beet Scheme (Red Tractor)	Voluntary	Sustainability Certificate	National	\N	13	2	\N	\N
31	Scottish Quality Farm Assured Combinable Crops (SQC)	Voluntary	Sustainability Certificate	National	\N	14	2	\N	\N
34	Trade Assurance Scheme for Combinable Crops (TASCC)	Voluntary	Sustainability Certificate	National	\N	16	2	\N	\N
35	Universal Feed Assurance Scheme (UFAS)	Voluntary	Sustainability Certificate	National	\N	16	2	\N	\N
17	German CertifHy Equivalent (H2Global Initiative)	Regulatory	EAC	National	\N	24	3	\N	\N
39	Rheinland H2.21	Voluntary	EAC	National	\N	19	3	\N	\N
20	PosHYdon Certification (Hydrogen from Offshore Wind)	Voluntary	EAC	National	\N	21	4	\N	\N
23	Denmark Green Gas Certification	Regulatory	EAC	National	7	6	5	\N	\N
24	Swedish Biogas & Biofuels Sustainability Certification	Regulatory	Sustainability Certificate	National	8	7	6	\N	\N
25	Austrian Agricultural Certification Scheme (AACS)	Voluntary	Sustainability Certificate	National	\N	8	7	\N	\N
28	KZR INiG system	Voluntary	Sustainability Certificate	National	10	11	8	\N	\N
15	CORSIA (Carbon Offsetting and Reduction Scheme for International Aviation)	Regulatory	Sustainability Certificate	Global	\N	22	\N	\N	\N
18	Smart Gas Grid Certification (SGGC)	Voluntary	EAC	Regional	\N	25	9	\N	\N
6	2BSvs	Regulatory	Sustainability Certificate	Regional	3	29	9	\N	\N
13	EKOenergy Label	Voluntary	EAC	Regional	\N	32	9	\N	\N
19	Carbon Trust Carbon Neutral Certification	Voluntary	Sustainability Certificate	Regional	\N	26	9	\N	\N
22	AIB (Association of Issuing Bodies) - European Energy Certificate System (EECS)	Regulatory	EAC	Regional	\N	20	9	\N	\N
1	ISCC EU (International Sustainability & Carbon Certification)	Regulatory	Sustainability Certificate	Regional	1	18	9	\N	\N
2	ISCC PLUS	Voluntary	Sustainability Certificate	Regional	1	18	9	\N	\N
33	Sustainable Resources (SURE) voluntary scheme	Voluntary	Sustainability Certificate	Regional	\N	1	9	\N	\N
44	REDcert Certification for SAF	Regulatory	Sustainability Certificate	Regional	\N	1	9	\N	\N
3	REDcert-EU	Regulatory	Sustainability Certificate	Regional	1	1	9	\N	\N
38	International Sustainability and Carbon Certification (ISCC EU)	Voluntary	Sustainability Certificate	Regional	1	5	9	\N	\N
5	CertifHy - RFNBO	Regulatory	Sustainability Certificate	Regional	\N	28	9	\N	\N
9	RFNBO Certification	Regulatory	Sustainability Certificate	Regional	\N	17	9	\N	\N
10	EU ETS	Regulatory	\N	Regional	\N	17	9	\N	\N
14	Guarantee of Origin (GO) for Renewable Gas	Regulatory	EAC	Regional	\N	17	9	\N	\N
21	Marine Fuel EU Certification (Pending)	Regulatory	Sustainability Certificate	Regional	\N	17	9	\N	\N
36	Union Database for Biofuels (UDB)	Regulatory	\N	Regional	\N	17	9	\N	\N
37	Carbon Border Adjustment Mechanism (CBAM)	Regulatory	\N	Regional	\N	17	9	\N	\N
43	EU ETS Carbon Credits	Regulatory	\N	Regional	\N	17	9	\N	\N
7	RSB	Voluntary	Sustainability Certificate	Regional	4	27	9	\N	\N
8	HVO Certification	Regulatory	Sustainability Certificate	Regional	\N	27	9	\N	\N
26	Better Biomass	Voluntary	Sustainability Certificate	Regional	9	9	9	\N	\N
27	Bonsucro EU	Voluntary	Sustainability Certificate	Regional	4	10	9	\N	\N
29	Programme for the Endorsement of Forest Certification (PEFC)	Voluntary	Sustainability Certificate	Regional	\N	12	9	\N	\N
32	Sustainable Biomass Program (SBP)	Voluntary	Sustainability Certificate	Regional	\N	15	9	\N	\N
40	GHG Reduction Certificate	Voluntary	\N	Regional	\N	3	9	\N	\N
41	SÜD CMS 70	Voluntary	\N	Regional	\N	3	9	\N	\N
42	Renewable Ammonia Certification	Voluntary	Sustainability Certificate	Regional	\N	3	9	\N	\N
4	CertifHy - National Green Certificate (NGC)	Voluntary	EAC	Regional	\N	28	9	{"process": {"steps": [{"title": "Registration as an account holder", "details": ["Registration is the mandatory first step for accessing the CertifHy™ certification system. Legal entities must submit a registration form, identity proof, and complete a \\"know your customer\\" questionnaire to prevent fraud. Only one account per legal entity is permitted.", "After CertifHy™ validates the application and confirms business integrity, applicants gain registry access to manage certificates (issuance, transfer, and cancellation). Account holders must verify their information annually, and CertifHy™ may conduct periodic verification checks to maintain registry accuracy."]}, {"title": "Registration of product device", "details": ["After account registration, production device registration is required. Authorized account holders submit detailed forms, which CertifHy™ initially reviews for eligibility and compliance.", "Approved applications undergo a comprehensive audit by a CertifHy™-certified body examining the device, energy sources, and emissions. Following audit review and cross-registry checks, the device is registered with ongoing compliance requirements including annual inspections and five-year audits."]}, {"title": "Registration production baches", "details": ["Following production batch registration, account holders apply for certificate issuance, which may cover one or more batches.", "While gas storage facilities are not typically considered production devices, certificates can be issued in two specific scenarios: when CertifHyTM certificates are cancelled to prove attributes of energy fed into storage, or when energy fed into storage was produced onsite with the requested attributes, has not received CertifHyTM certification, and wont be disclosed except in relation to certificates issued for the storage device s hydrogen output."]}, {"title": "Request for certificate issuance", "details": ["Following production batch registration, account holders apply for certificate issuance, which may cover one or more batches.", "While gas storage facilities are not typically considered production devices, certificates can be issued in two specific scenarios: when CertifHyTM certificates are cancelled to prove attributes of energy fed into storage, or when energy fed into storage was produced onsite with the requested attributes, has not received CertifHyTM certification, and wont be disclosed except in relation to certificates issued for the storage device s hydrogen output."]}, {"title": "Information verification", "details": ["Following production batch registration, account holders apply for certificate issuance, which may cover one or more batches.", "While gas storage facilities are not typically considered production devices, certificates can be issued in two specific scenarios: when CertifHyTM certificates are cancelled to prove attributes of energy fed into storage, or when energy fed into storage was produced onsite with the requested attributes, has not received CertifHyTM certification, and wont be disclosed except in relation to certificates issued for the storage device s hydrogen output."]}, {"title": "Production batch audit", "details": ["A CertifHy™-approved certification body conducts an audit of each production batch based on the account holder s track record, the production device, and past certificate issuances.", "This audit, performed under ISO 14064-3 and EU Directive 2003/87/EC, ensures accuracy, prevents double counting, and verifies key energy attributes like the share of renewable energy and the well-to-gate PCF.", "The process includes risk assessment and a review of internal procedures, with findings documented in a report submitted to both the account holder and CertifHy™."]}, {"title": "CertifHyTM Reviews Audit Report", "details": ["CertifHy™ reviews the production batch audit to ensure consistency between the registered data and the audit report.", "It verifies that the batch has not been registered elsewhere with different energy attributes and checks other registries to prevent duplicate certifications. Based on this review, the certificate issuance is either approved, sent for further inspection, or rejected."]}, {"title": "CertifHyTM Issues Certificate ", "details": ["CertifHy™ reviews the production batch audit to ensure consistency between the registered data and the audit report.", "It verifies that the batch has not been registered elsewhere with different energy attributes and checks other registries to prevent duplicate certifications. Based on this review, the certificate issuance is either approved, sent for further inspection, or rejected."]}]}, "overview": {"types": {"title": "CertifHy™ Certification Types", "types": [{"details": ["Produced using 100% renewable energy (solar, wind, hydro, biomass).", "Helps reduce carbon emissions to net-zero levels."], "type_title": "CertifHy™ Renewable Hydrogen (Green Hydrogen)"}, {"details": ["Produced using natural gas + carbon capture (CCS) to limit emissions.", "Supports industries transitioning to cleaner alternatives."], "type_title": "CertifHy™ Low-Carbon Hydrogen (Blue Hydrogen)"}]}, "ensure": {"list": ["Standardized Green Hydrogen Certification - CertifHy™ sets the benchmark for green hydrogen labeling across Europe.", "Transparency in the Hydrogen Market - Helps consumers trace the origin of hydrogen and verify sustainability claims.", "Market Access for Certified Producers - Companies with CertifHy™ certification can trade hydrogen internationally with a recognized label.", "Regulatory Compliance - Aligns with EU policies on renewable energy and carbon reduction goals (e.g., Fit for 55, RED II).", "Support for Decarbonization - Encourages the transition to a hydrogen-based economy by promoting clean energy sources."], "title": "What Does CertifHy™ Ensure?"}, "description": "The CertifHy™ Scheme is a recognized certification system for renewable and low-carbon hydrogen in Europe. It ensures transparency, credibility, and standardization in the hydrogen market by verifying the origin and sustainability of hydrogen production. CertifHy™ creates a system of Guarantees of Origin (GO) and Certification of Compliance (CoC) to classify hydrogen based on its environmental impact. This allows industries, policymakers, and consumers to differentiate between hydrogen produced from renewable sources (such as wind, solar, or biomass) and hydrogen derived from low-carbon methods (such as carbon capture and storage)."}, "requirements": {"criteria": {"title": "General Eligibility Criteria", "criteria_list": [{"details": ["The producer must provide detailed documentation on the energy sources and production process.", "The facility must have a tracking system to distinguish certified hydrogen from non-certified hydrogen."], "criterion_title": "Hydrogen Production Must Be Tracked and Verified"}, {"details": ["CertifHy™ aligns with EU Renewable Energy Directive (RED II) and Fit for 55 policies.", "Hydrogen must comply with carbon footprint thresholds defined by the certification."], "criterion_title": "Compliance with European & International Regulations"}, {"details": ["Companies must undergo a third-party audit to validate their production claims.", "The auditing body verifies the origin of electricity, CO2 emissions, and sustainability criteria."], "criterion_title": "Verification by an Independent Auditor"}]}, "description": "To obtain CertifHy™ certification, hydrogen producers must meet specific criteria related to sustainability, production methods, carbon footprint, and traceability. These requirements ensure that hydrogen labeled as renewable (green) or low-carbon (blue) meets environmental and regulatory standards.", "specific_low": {"list": ["Be produced from fossil fuels (e.g., natural gas) with Carbon Capture and Storage (CCS).", "Achieve at least a 60% CO2 reduction compared to conventional hydrogen production.", "Emit ≤ 36.4 g CO2 per MJ of hydrogen, even with CCS applied."], "title": "Specific Requirements for CertifHy™ Low-Carbon Hydrogen", "description": "To be classified as \\"Low-Carbon Hydrogen\\" (Blue Hydrogen) under CertifHy™, hydrogen production must:"}, "specific_green": {"list": ["Be powered by 100% renewable energy (wind, solar, hydro, biomass).", "Emit ≤ 36.4 g CO2 per MJ of hydrogen (aligned with RED II standards).", "Have a verified Guarantee of Origin (GO) confirming the use of renewable energy.", "Ensure additionality – meaning the renewable energy used is new and does not replace existing renewable power."], "title": "Specific Requirements for CertifHy™ Green Hydrogen", "description": "To be classified as \\"Renewable Hydrogen\\" (Green Hydrogen) under CertifHy™, hydrogen production must:"}}, "track_process": {"tasks": [{"sub_task": ["Submit a registration form", "Validation of the application form"], "task_title": "Registration as an account holder"}, {"sub_task": ["Submit device details", "Complete technical assessment"], "task_title": "Registration of production device"}]}, "recommendation_overview": {"features": ["Guarantees of Origin (GO) for renewable hydrogen.", "Tracks carbon footprint and sustainability.", "Recognized in Europe for hydrogen production and trade."], "description": "The first EU-wide green hydrogen certification system ensuring transparency and credibility in hydrogen production."}, "short_certification_overview": "This certificate guarantees that the hydrogen produced meets the CertifHy™ criteria for Green or Low-Carbon Hydrogen. It ensures traceability, sustainability, and compliance with European market standards."}	12 months
\.


--
-- Data for Name: certification_schemes_certification_bodies; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.certification_schemes_certification_bodies (certification_scheme_id, cb_id) FROM stdin;
1	1
2	2
3	3
3	4
4	5
4	3
4	6
4	7
5	5
5	3
5	6
5	7
6	8
7	9
7	6
8	1
8	3
8	5
9	5
9	1
9	6
9	3
9	7
10	10
11	11
12	12
13	13
14	14
14	15
15	16
16	17
17	18
18	19
19	20
20	21
22	22
25	23
26	24
27	25
28	26
28	27
29	28
29	7
30	29
31	30
32	31
32	7
33	32
33	4
34	33
35	34
37	35
38	36
38	6
39	37
39	4
40	3
40	7
40	6
41	3
42	1
42	3
42	7
42	6
43	38
44	39
\.


--
-- Data for Name: certification_schemes_certification_scheme_holders; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.certification_schemes_certification_scheme_holders (certification_scheme_id, csh_id) FROM stdin;
1	1
2	1
3	2
4	3
5	3
6	4
7	5
10	7
11	8
12	9
13	10
14	11
15	12
16	13
17	14
19	15
20	16
21	7
22	11
23	17
24	18
25	19
26	20
27	21
28	22
29	23
38	1
\.


--
-- Data for Name: certification_schemes_fuel_types; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.certification_schemes_fuel_types (certification_scheme_id, fuel_id) FROM stdin;
1	5
2	1
3	5
4	1
5	1
6	5
7	4
7	5
8	5
9	1
9	6
12	4
12	5
13	6
14	1
14	6
15	4
15	5
16	5
16	1
16	6
17	1
17	2
18	6
19	1
19	3
19	4
19	5
20	1
21	1
21	2
21	3
21	5
22	1
22	2
22	6
23	6
24	5
24	6
25	5
26	5
27	5
28	5
29	5
30	5
31	5
32	5
33	5
34	5
35	5
36	5
37	1
37	2
37	3
37	4
37	5
37	6
38	5
38	6
38	1
38	4
39	1
40	1
41	1
42	2
43	1
44	4
\.


--
-- Data for Name: certification_schemes_legislation_compliances; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.certification_schemes_legislation_compliances (certification_scheme_id, lc_id) FROM stdin;
1	1
2	1
3	1
5	1
6	1
7	1
7	2
8	1
9	1
9	3
10	4
11	5
12	6
13	7
14	1
15	8
16	7
17	9
18	1
18	4
19	7
20	10
21	1
21	11
22	1
23	12
24	13
25	1
26	1
27	1
28	1
29	1
30	1
31	1
32	1
33	1
34	1
35	1
36	1
37	14
38	1
43	4
44	1
\.


--
-- Data for Name: certifications; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.certifications (certification_id, plant_id, certification_scheme_id, ib_id, status, created_at) FROM stdin;
1	1	4	1	Active	2024-03-15 00:00:00
2	1	39	2	Expired	2024-05-20 00:00:00
\.


--
-- Data for Name: certifications_documents; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.certifications_documents (certification_id, document_id) FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.documents (document_id, plant_id, document_urn, upload_time) FROM stdin;
\.


--
-- Data for Name: fuel_types; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.fuel_types (fuel_id, fuel_name, fuel_full_name) FROM stdin;
1	Hydrogen	\N
2	Ammonia	\N
3	Methanol	\N
4	SAF	Sustainable Aviation Fuel
5	Biofuels	\N
6	e-NG	electro-methane, biomethane
\.


--
-- Data for Name: issuing_bodies; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.issuing_bodies (ib_id, ib_name) FROM stdin;
1	REDcert
2	ISCC
3	TÜV SÜD
4	DNV
5	Bureau Veritas
6	Danish Energy Agency
7	Swedish Energy Agency
8	Austrian Government
9	Netherlands Standardization Institute (NEN)
10	Bonsucro
11	Oil and Gas Institute – National Research Institute
12	PEFC International
13	Assured Food Standards (AFS)
14	Scottish Quality Crops Ltd
15	Sustainable Biomass Program
16	Agricultural Industries Confederation (AIC)
17	European Commission
18	ISCC System GmbH
19	Rheinland
20	AIB
21	PosHYdon Consortium
22	ICAO
23	World Resources Institute (WRI)
24	German Federal Government
25	European Biogas Association
26	Carbon Trust
27	RSB Association
28	Hydrogen Europe
29	2BS Consortium
30	French Ministry of Ecological Transition
31	UK Department for Transport
32	EKOenergy Network
\.


--
-- Data for Name: legislation_compliances; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.legislation_compliances (lc_id, lc_name) FROM stdin;
1	RED II
2	CORSIA
3	RED II, Fuel Quality Directive
4	ETS Directive
5	French Low Carbon Label
6	UK National Renewable Fuel Obligation
7	EU Climate Policies
8	ICAO International Standard
9	German National Hydrogen Strategy
10	National Dutch Legislation
11	FuelEU Maritime
12	Danish National Policy
13	Swedish Energy Policy
14	CBAM Regulation
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.notifications (id, type, message, "timestamp", read) FROM stdin;
4	new_certification	A new certification is available.	2025-10-04 13:00:00	t
3	risk_score_update	Your risk score has been updated.	2025-10-03 12:00:00	t
1	plant_added	Plant added successfully!	2025-10-01 10:00:00	t
5	login_from_other_device	Login detected from another device.	2025-10-05 14:00:00	t
2	profile_update	Your profile has been updated.	2025-10-02 11:00:00	t
\.


--
-- Data for Name: plant_stages; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.plant_stages (stage_id, stage_name) FROM stdin;
1	Pre-Feasibility & Concept Development
2	Feasibility Study & Front-End Engineering Design (FEED)
3	Permitting & Regulatory Approvals
4	Engineering, Procurement & Construction (EPC)
5	Commissioning & Start-up
6	Operations & Optimization
7	Decommissioning & Repurposing (End-of-Life Phase)
\.


--
-- Data for Name: plants; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.plants (plant_id, plant_name, email, operator_id, address_id, fuel_id, stage_id) FROM stdin;
1	HydroGenTech	contact@hydrogentech.com	1	1	1	\N
2	EcoFuel Industries	info@ecofuel.com	2	2	5	\N
\.


--
-- Data for Name: recommendations; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.recommendations (recommendation_id, plant_id, certification_scheme_id, compliance_score, created_at, overview) FROM stdin;
1	1	4	85	2024-09-01 00:00:00	{"title": "Certify™ Scheme", "features": ["Guarantees of Origin (GO) for renewable hydrogen.", "Tracks carbon footprint and sustainability.", "Recognised in Europe for hydrogen production and trade."], "description": "The first EU-wide green hydrogen certification system ensuring transparency and credibility in hydrogen production.", "validity_months": 12, "certification_entity": "Certify"}
2	1	39	45	2025-03-12 17:39:52	{"title": "Rheinland H2.21", "features": ["Focuses on industrial hydrogen applications.", "Ensures compliance with German and EU regulations.", "Recognised in energy and transportation sectors."], "description": "A German certification system ensuring hydrogen meets sustainability and regulatory standards.", "validity_months": 12, "certification_entity": "TÜV"}
3	2	4	45	2025-03-17 22:04:11	{"title": "Certify™ Scheme", "features": ["Guarantees of Origin (GO) for renewable hydrogen.", "Tracks carbon footprint and sustainability.", "Recognised in Europe for hydrogen production and trade."], "description": "The first EU-wide green hydrogen certification system ensuring transparency and credibility in hydrogen production.", "validity_months": 12, "certification_entity": "Certify"}
\.


--
-- Data for Name: risk_profiles; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.risk_profiles (risk_profile_id, plant_id, risk_score, created_at) FROM stdin;
1	1	80	2025-03-11 00:00:00
2	2	25	2025-03-11 14:02:48
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.users (user_id, first_name, last_name, email, phone_number, address_id, user_role, created_at, "position") FROM stdin;
1	Alice	Smith	alice.smith@example.com	1234567890	1	Plant Operator	2025-03-10 16:43:04.128169	\N
2	Bob	Johnson	bob.johnson@example.com	0987654321	2	Compliance Team	2025-03-10 16:43:04.128169	\N
\.


--
-- Name: accreditation_bodies_ab_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.accreditation_bodies_ab_id_seq', 10, true);


--
-- Name: address_address_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.address_address_id_seq', 9, true);


--
-- Name: alerts_alert_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.alerts_alert_id_seq', 1, false);


--
-- Name: certification_bodies_cb_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.certification_bodies_cb_id_seq', 39, true);


--
-- Name: certification_scheme_holders_csh_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.certification_scheme_holders_csh_id_seq', 23, true);


--
-- Name: certification_schemes_certification_scheme_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.certification_schemes_certification_scheme_id_seq', 44, true);


--
-- Name: certifications_certification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.certifications_certification_id_seq', 1, false);


--
-- Name: documents_document_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.documents_document_id_seq', 1, false);


--
-- Name: fuel_types_fuel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.fuel_types_fuel_id_seq', 6, true);


--
-- Name: issuing_bodies_ib_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.issuing_bodies_ib_id_seq', 32, true);


--
-- Name: legislation_compliances_lc_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.legislation_compliances_lc_id_seq', 14, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.notifications_id_seq', 10, true);


--
-- Name: plant_stages_stage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.plant_stages_stage_id_seq', 7, true);


--
-- Name: plants_plant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.plants_plant_id_seq', 1, false);


--
-- Name: recommendations_recommendation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.recommendations_recommendation_id_seq', 1, false);


--
-- Name: risk_profiles_risk_profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.risk_profiles_risk_profile_id_seq', 1, false);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.users_user_id_seq', 1, false);


--
-- Name: accreditation_bodies accreditation_bodies_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.accreditation_bodies
    ADD CONSTRAINT accreditation_bodies_pkey PRIMARY KEY (ab_id);


--
-- Name: address address_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.address
    ADD CONSTRAINT address_pkey PRIMARY KEY (address_id);


--
-- Name: alert_recipients alert_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.alert_recipients
    ADD CONSTRAINT alert_recipients_pkey PRIMARY KEY (alert_id, user_id);


--
-- Name: alerts alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_pkey PRIMARY KEY (alert_id);


--
-- Name: certification_bodies certification_bodies_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certification_bodies
    ADD CONSTRAINT certification_bodies_pkey PRIMARY KEY (cb_id);


--
-- Name: certification_scheme_holders certification_scheme_holders_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certification_scheme_holders
    ADD CONSTRAINT certification_scheme_holders_pkey PRIMARY KEY (csh_id);


--
-- Name: certification_schemes_certification_bodies certification_schemes_certification_bodies_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certification_schemes_certification_bodies
    ADD CONSTRAINT certification_schemes_certification_bodies_pkey PRIMARY KEY (certification_scheme_id, cb_id);


--
-- Name: certification_schemes_certification_scheme_holders certification_schemes_certification_scheme_holders_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certification_schemes_certification_scheme_holders
    ADD CONSTRAINT certification_schemes_certification_scheme_holders_pkey PRIMARY KEY (certification_scheme_id, csh_id);


--
-- Name: certification_schemes_fuel_types certification_schemes_fuel_types_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certification_schemes_fuel_types
    ADD CONSTRAINT certification_schemes_fuel_types_pkey PRIMARY KEY (certification_scheme_id, fuel_id);


--
-- Name: certification_schemes_legislation_compliances certification_schemes_legislation_compliances_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certification_schemes_legislation_compliances
    ADD CONSTRAINT certification_schemes_legislation_compliances_pkey PRIMARY KEY (certification_scheme_id, lc_id);


--
-- Name: certification_schemes certification_schemes_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certification_schemes
    ADD CONSTRAINT certification_schemes_pkey PRIMARY KEY (certification_scheme_id);


--
-- Name: certifications_documents certifications_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certifications_documents
    ADD CONSTRAINT certifications_documents_pkey PRIMARY KEY (certification_id, document_id);


--
-- Name: certifications certifications_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT certifications_pkey PRIMARY KEY (certification_id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (document_id);


--
-- Name: fuel_types fuel_types_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.fuel_types
    ADD CONSTRAINT fuel_types_pkey PRIMARY KEY (fuel_id);


--
-- Name: issuing_bodies issuing_bodies_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.issuing_bodies
    ADD CONSTRAINT issuing_bodies_pkey PRIMARY KEY (ib_id);


--
-- Name: legislation_compliances legislation_compliances_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.legislation_compliances
    ADD CONSTRAINT legislation_compliances_pkey PRIMARY KEY (lc_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: plant_stages plant_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.plant_stages
    ADD CONSTRAINT plant_stages_pkey PRIMARY KEY (stage_id);


--
-- Name: plants plants_email_key; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_email_key UNIQUE (email);


--
-- Name: plants plants_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_pkey PRIMARY KEY (plant_id);


--
-- Name: recommendations recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.recommendations
    ADD CONSTRAINT recommendations_pkey PRIMARY KEY (recommendation_id);


--
-- Name: risk_profiles risk_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.risk_profiles
    ADD CONSTRAINT risk_profiles_pkey PRIMARY KEY (risk_profile_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_number_key UNIQUE (phone_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: alert_recipients alert_recipients_alert_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.alert_recipients
    ADD CONSTRAINT alert_recipients_alert_id_fkey FOREIGN KEY (alert_id) REFERENCES public.alerts(alert_id) ON DELETE CASCADE;


--
-- Name: alert_recipients alert_recipients_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.alert_recipients
    ADD CONSTRAINT alert_recipients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: certification_schemes fk_accreditation_body; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certification_schemes
    ADD CONSTRAINT fk_accreditation_body FOREIGN KEY (accreditation_body_id) REFERENCES public.accreditation_bodies(ab_id);


--
-- Name: users fk_address; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_address FOREIGN KEY (address_id) REFERENCES public.address(address_id);


--
-- Name: plants fk_address; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT fk_address FOREIGN KEY (address_id) REFERENCES public.address(address_id);


--
-- Name: certification_schemes fk_address; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certification_schemes
    ADD CONSTRAINT fk_address FOREIGN KEY (address_id) REFERENCES public.address(address_id);


--
-- Name: certifications_documents fk_ceritication; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certifications_documents
    ADD CONSTRAINT fk_ceritication FOREIGN KEY (certification_id) REFERENCES public.certifications(certification_id);


--
-- Name: certification_schemes_certification_bodies fk_certification_body; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certification_schemes_certification_bodies
    ADD CONSTRAINT fk_certification_body FOREIGN KEY (cb_id) REFERENCES public.certification_bodies(cb_id);


--
-- Name: certifications fk_certification_scheme; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT fk_certification_scheme FOREIGN KEY (certification_scheme_id) REFERENCES public.certification_schemes(certification_scheme_id);


--
-- Name: recommendations fk_certification_scheme; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.recommendations
    ADD CONSTRAINT fk_certification_scheme FOREIGN KEY (certification_scheme_id) REFERENCES public.certification_schemes(certification_scheme_id);


--
-- Name: certification_schemes_fuel_types fk_certification_scheme; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certification_schemes_fuel_types
    ADD CONSTRAINT fk_certification_scheme FOREIGN KEY (certification_scheme_id) REFERENCES public.certification_schemes(certification_scheme_id);


--
-- Name: certification_schemes_certification_bodies fk_certification_scheme; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certification_schemes_certification_bodies
    ADD CONSTRAINT fk_certification_scheme FOREIGN KEY (certification_scheme_id) REFERENCES public.certification_schemes(certification_scheme_id);


--
-- Name: certification_schemes_legislation_compliances fk_certification_scheme; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certification_schemes_legislation_compliances
    ADD CONSTRAINT fk_certification_scheme FOREIGN KEY (certification_scheme_id) REFERENCES public.certification_schemes(certification_scheme_id);


--
-- Name: certification_schemes_certification_scheme_holders fk_certification_scheme; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certification_schemes_certification_scheme_holders
    ADD CONSTRAINT fk_certification_scheme FOREIGN KEY (certification_scheme_id) REFERENCES public.certification_schemes(certification_scheme_id);


--
-- Name: certification_schemes_certification_scheme_holders fk_certification_scheme_holder; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certification_schemes_certification_scheme_holders
    ADD CONSTRAINT fk_certification_scheme_holder FOREIGN KEY (csh_id) REFERENCES public.certification_scheme_holders(csh_id);


--
-- Name: certifications_documents fk_document; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certifications_documents
    ADD CONSTRAINT fk_document FOREIGN KEY (document_id) REFERENCES public.documents(document_id);


--
-- Name: alerts fk_fuel; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT fk_fuel FOREIGN KEY (fuel_id) REFERENCES public.fuel_types(fuel_id);


--
-- Name: plants fk_fuel_type; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT fk_fuel_type FOREIGN KEY (fuel_id) REFERENCES public.fuel_types(fuel_id);


--
-- Name: certification_schemes_fuel_types fk_fuel_type; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certification_schemes_fuel_types
    ADD CONSTRAINT fk_fuel_type FOREIGN KEY (fuel_id) REFERENCES public.fuel_types(fuel_id);


--
-- Name: certifications fk_ib; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT fk_ib FOREIGN KEY (ib_id) REFERENCES public.issuing_bodies(ib_id);


--
-- Name: alerts fk_issuer; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT fk_issuer FOREIGN KEY (issuer_id) REFERENCES public.users(user_id);


--
-- Name: certification_schemes fk_issuing_body; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certification_schemes
    ADD CONSTRAINT fk_issuing_body FOREIGN KEY (issuing_body_id) REFERENCES public.issuing_bodies(ib_id);


--
-- Name: certification_schemes_legislation_compliances fk_legislation_compliance; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certification_schemes_legislation_compliances
    ADD CONSTRAINT fk_legislation_compliance FOREIGN KEY (lc_id) REFERENCES public.legislation_compliances(lc_id);


--
-- Name: plants fk_operator; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT fk_operator FOREIGN KEY (operator_id) REFERENCES public.users(user_id);


--
-- Name: documents fk_plant; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT fk_plant FOREIGN KEY (plant_id) REFERENCES public.plants(plant_id);


--
-- Name: certifications fk_plant; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT fk_plant FOREIGN KEY (plant_id) REFERENCES public.plants(plant_id);


--
-- Name: recommendations fk_plant; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.recommendations
    ADD CONSTRAINT fk_plant FOREIGN KEY (plant_id) REFERENCES public.plants(plant_id);


--
-- Name: alerts fk_region; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT fk_region FOREIGN KEY (region_id) REFERENCES public.address(address_id);


--
-- Name: plants plants_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.plant_stages(stage_id);


--
-- Name: SCHEMA aiven_extras; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA aiven_extras TO avnadmin WITH GRANT OPTION;


--
-- Name: FUNCTION auto_explain_load(); Type: ACL; Schema: aiven_extras; Owner: postgres
--

GRANT ALL ON FUNCTION aiven_extras.auto_explain_load() TO avnadmin WITH GRANT OPTION;


--
-- Name: FUNCTION claim_public_schema_ownership(); Type: ACL; Schema: aiven_extras; Owner: postgres
--

GRANT ALL ON FUNCTION aiven_extras.claim_public_schema_ownership() TO avnadmin WITH GRANT OPTION;


--
-- Name: FUNCTION dblink_slot_create_or_drop(arg_connection_string text, arg_slot_name text, arg_action text); Type: ACL; Schema: aiven_extras; Owner: postgres
--

GRANT ALL ON FUNCTION aiven_extras.dblink_slot_create_or_drop(arg_connection_string text, arg_slot_name text, arg_action text) TO avnadmin WITH GRANT OPTION;


--
-- Name: FUNCTION pg_create_publication_for_all_tables(arg_publication_name text, arg_publish text); Type: ACL; Schema: aiven_extras; Owner: postgres
--

GRANT ALL ON FUNCTION aiven_extras.pg_create_publication_for_all_tables(arg_publication_name text, arg_publish text) TO avnadmin WITH GRANT OPTION;


--
-- Name: FUNCTION pg_create_subscription(arg_subscription_name text, arg_connection_string text, arg_publication_name text, arg_slot_name text, arg_slot_create boolean, arg_copy_data boolean, arg_origin text); Type: ACL; Schema: aiven_extras; Owner: postgres
--

GRANT ALL ON FUNCTION aiven_extras.pg_create_subscription(arg_subscription_name text, arg_connection_string text, arg_publication_name text, arg_slot_name text, arg_slot_create boolean, arg_copy_data boolean, arg_origin text) TO avnadmin WITH GRANT OPTION;


--
-- Name: FUNCTION pg_drop_subscription(arg_subscription_name text, arg_drop_repl_slot boolean); Type: ACL; Schema: aiven_extras; Owner: postgres
--

GRANT ALL ON FUNCTION aiven_extras.pg_drop_subscription(arg_subscription_name text, arg_drop_repl_slot boolean) TO avnadmin WITH GRANT OPTION;


--
-- Name: FUNCTION pg_list_all_subscriptions(); Type: ACL; Schema: aiven_extras; Owner: postgres
--

GRANT ALL ON FUNCTION aiven_extras.pg_list_all_subscriptions() TO avnadmin WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_replication_list(); Type: ACL; Schema: aiven_extras; Owner: postgres
--

GRANT ALL ON FUNCTION aiven_extras.pg_stat_replication_list() TO avnadmin WITH GRANT OPTION;


--
-- Name: FUNCTION session_replication_role(arg_parameter text); Type: ACL; Schema: aiven_extras; Owner: postgres
--

GRANT ALL ON FUNCTION aiven_extras.session_replication_role(arg_parameter text) TO avnadmin WITH GRANT OPTION;


--
-- Name: FUNCTION set_auto_explain_log_analyze(arg_parameter text); Type: ACL; Schema: aiven_extras; Owner: postgres
--

GRANT ALL ON FUNCTION aiven_extras.set_auto_explain_log_analyze(arg_parameter text) TO avnadmin WITH GRANT OPTION;


--
-- Name: FUNCTION set_auto_explain_log_buffers(arg_parameter text); Type: ACL; Schema: aiven_extras; Owner: postgres
--

GRANT ALL ON FUNCTION aiven_extras.set_auto_explain_log_buffers(arg_parameter text) TO avnadmin WITH GRANT OPTION;


--
-- Name: FUNCTION set_auto_explain_log_format(arg_parameter text); Type: ACL; Schema: aiven_extras; Owner: postgres
--

GRANT ALL ON FUNCTION aiven_extras.set_auto_explain_log_format(arg_parameter text) TO avnadmin WITH GRANT OPTION;


--
-- Name: FUNCTION set_auto_explain_log_min_duration(arg_parameter text); Type: ACL; Schema: aiven_extras; Owner: postgres
--

GRANT ALL ON FUNCTION aiven_extras.set_auto_explain_log_min_duration(arg_parameter text) TO avnadmin WITH GRANT OPTION;


--
-- Name: FUNCTION set_auto_explain_log_nested_statements(arg_parameter text); Type: ACL; Schema: aiven_extras; Owner: postgres
--

GRANT ALL ON FUNCTION aiven_extras.set_auto_explain_log_nested_statements(arg_parameter text) TO avnadmin WITH GRANT OPTION;


--
-- Name: FUNCTION set_auto_explain_log_timing(arg_parameter text); Type: ACL; Schema: aiven_extras; Owner: postgres
--

GRANT ALL ON FUNCTION aiven_extras.set_auto_explain_log_timing(arg_parameter text) TO avnadmin WITH GRANT OPTION;


--
-- Name: FUNCTION set_auto_explain_log_verbose(arg_parameter text); Type: ACL; Schema: aiven_extras; Owner: postgres
--

GRANT ALL ON FUNCTION aiven_extras.set_auto_explain_log_verbose(arg_parameter text) TO avnadmin WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_replication; Type: ACL; Schema: aiven_extras; Owner: postgres
--

GRANT SELECT ON TABLE aiven_extras.pg_stat_replication TO avnadmin WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

