"""Streamlit version of the phishing analyzer (alternative to the React UI).

Run:  streamlit run streamlit_app.py
"""

import re

import streamlit as st

from analyzer import load_model

# Page config
st.set_page_config(
    page_title='Phishing Detection',
    page_icon='🛡️',
    layout='wide',
    initial_sidebar_state='collapsed'
)

# Custom CSS
st.markdown(r"""
<style>
    :root {
        color-scheme: light;
    }

    body {
        background: #f3f4f6;
        color: #111827;
    }

    .stApp {
        background: #f3f4f6;
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    }

    .block-container {
        padding: 1.5rem 1.75rem 2rem;
        max-width: 1180px;
    }

    .hero-card,
    .panel-card,
    .info-card,
    .result-card {
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 20px;
        box-shadow: 0 14px 30px rgba(15, 23, 42, 0.06);
    }

    .hero-card {
        padding: 2rem 2.25rem;
        margin-bottom: 1.75rem;
    }

    .eyebrow {
        color: #475569;
        font-size: 0.82rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        margin-bottom: 0.75rem;
        font-weight: 700;
    }

    .hero-title {
        margin: 0;
        font-size: clamp(2.4rem, 2.8vw, 3.2rem);
        font-weight: 800;
        line-height: 1.05;
        color: #111827;
    }

    .hero-copy {
        margin: 1rem 0 0;
        max-width: 720px;
        color: #6b7280;
        font-size: 1rem;
        line-height: 1.8;
    }

    .section-heading {
        margin: 0 0 0.75rem;
        font-size: 1.05rem;
        font-weight: 700;
        color: #111827;
    }

    .section-subtitle {
        margin: 0;
        color: #6b7280;
        line-height: 1.7;
        font-size: 0.95rem;
    }

    .panel-card {
        padding: 1.75rem;
        margin-bottom: 1rem;
    }

    .button-row .stButton>button {
        width: 100%;
        border-radius: 14px !important;
        background: #475569 !important;
        border: 1px solid #475569 !important;
        color: #ffffff !important;
        padding: 0.82rem 1rem !important;
        font-size: 0.95rem !important;
        font-weight: 700 !important;
        transition: background 0.2s ease, transform 0.2s ease;
    }

    .button-row .stButton>button:hover {
        background: #334155 !important;
        transform: translateY(-1px);
    }

    .stTextArea textarea {
        border-radius: 16px !important;
        border: 1px solid #d1d5db !important;
        background: #ffffff !important;
        padding: 1rem !important;
        min-height: 320px !important;
        box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.04);
    }

    .stTextArea label {
        font-weight: 700;
        font-size: 0.95rem;
        color: #111827;
        margin-bottom: 0.75rem;
    }

    .stTextArea .stMarkdown p {
        margin: 0.5rem 0 0 0;
        color: #6b7280;
    }

    .info-card,
    .result-card {
        padding: 1.5rem;
        margin-bottom: 1rem;
    }

    .info-card h3,
    .result-card h3 {
        margin: 0 0 0.75rem;
        font-size: 1.05rem;
        color: #111827;
    }

    .info-card p,
    .info-card li,
    .result-card p,
    .result-card li {
        color: #6b7280;
        line-height: 1.75;
    }

    .info-card ul,
    .result-card ul {
        padding-left: 1.2rem;
        margin: 0.6rem 0 0 0;
    }

    .info-card li,
    .result-card li {
        margin-bottom: 0.65rem;
    }

    .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.45rem 0.85rem;
        border-radius: 999px;
        font-size: 0.82rem;
        font-weight: 700;
        letter-spacing: 0.01em;
        margin-right: 0.5rem;
        margin-bottom: 0.5rem;
    }

    .badge--high {
        background: #fef2f2;
        color: #b91c1c;
        border: 1px solid #fecaca;
    }

    .badge--medium {
        background: #f8fafc;
        color: #475569;
        border: 1px solid #cbd5e1;
    }

    .badge--low {
        background: #eef2ff;
        color: #4338ca;
        border: 1px solid #c7d2fe;
    }

    .tag {
        display: inline-flex;
        align-items: center;
        padding: 0.35rem 0.8rem;
        border-radius: 999px;
        background: #f8fafc;
        color: #475569;
        font-size: 0.85rem;
        margin-right: 0.5rem;
        margin-bottom: 0.5rem;
        border: 1px solid #e5e7eb;
    }

    .stAlert {
        border-radius: 16px;
    }

    footer {
        visibility: hidden;
    }

    .css-18ni7ap {
        padding: 0 !important;
    }
</style>
""", unsafe_allow_html=True)

model = load_model()

if 'email_input' not in st.session_state:
    st.session_state.email_input = ''

hero_html = """
<div class='hero-card'>
    <p class='eyebrow'>SECURITY DASHBOARD</p>
    <h1 class='hero-title'>Message security insights in one dashboard.</h1>
    <p class='hero-copy'>Inspect suspicious messages and see key phishing signals, risk level, and clear next steps without extra noise.</p>
</div>
"""
st.markdown(hero_html, unsafe_allow_html=True)

main_col, side_col = st.columns([3, 1], gap='large')

with main_col:
    st.markdown("""
    <div class='panel-card'>
        <p class='section-heading'>Message inspection</p>
        <p class='section-subtitle'>Quick examples to test the analyzer.</p>
    </div>
    """, unsafe_allow_html=True)

    example_cols = st.columns([1, 1, 1], gap='small')
    if example_cols[0].button('Suspicious password reset'):
        st.session_state.email_input = 'Subject: Password reset required\n\nWe noticed unusual activity on your account. Please reset your password now by clicking the link below.'
    if example_cols[1].button('Fake bank alert'):
        st.session_state.email_input = 'Subject: Important message from your bank\n\nYour account has been temporarily suspended. Verify your details immediately to avoid closure.'
    if example_cols[2].button('Prize scam message'):
        st.session_state.email_input = 'Subject: You won a prize!\n\nCongratulations! Claim your reward by entering your login and payment details now.'

    with st.form('phishing_form'):
        st.markdown("""
        <div class='panel-card'>
            <p class='section-heading'>Analyze message</p>
            <p class='section-subtitle'>Paste a suspicious message, email, or login prompt in the field below.</p>
        </div>
        """, unsafe_allow_html=True)

        email_text = st.text_area(
            'Message content',
            key='email_input',
            height=340,
            label_visibility='visible',
            placeholder='Paste a suspicious email or message here to analyze red flags like urgency, fake links, or requests for sensitive information.',
            help='Only use sample text or test messages. Do not paste real passwords, bank details, or private personal information.'
        )

        st.caption('Paste an email message, suspicious text, or login request to check for phishing signs.')
        submitted = st.form_submit_button('Analyze message')

    if submitted:
        if not email_text.strip():
            st.warning('Please paste some message content before analyzing.')
        else:
            with st.spinner('Analyzing message...'):
                try:
                    prediction = model.predict([email_text])[0]
                    probabilities = model.predict_proba([email_text])[0]
                    phishing_score = probabilities[1]

                    risk_level = 'High' if phishing_score > 0.7 else 'Medium' if phishing_score > 0.4 else 'Low'
                    badge_class = 'badge--high' if risk_level == 'High' else 'badge--medium' if risk_level == 'Medium' else 'badge--low'

                    lower_text = email_text.lower()
                    indicators = []
                    if re.search(r"\b(urgent|act now|immediately|asap|limited time|final notice|now or never)\b", lower_text):
                        indicators.append('Urgent language')
                    if any(word in lower_text for word in ['password', 'login', 'code', 'verify', 'confirm', 'security question', 'account details']):
                        indicators.append('Password request')
                    if any(token in lower_text for token in ['http://', 'https://', 'www.', 'click here', 'verify your', 'update your', 'confirm your']):
                        indicators.append('Suspicious links')
                    if any(word in lower_text for word in ['bank', 'account suspended', 'billing', 'verification', 'security alert']):
                        indicators.append('Impersonation')
                    if not indicators:
                        indicators.append('No common red flags found')

                    result_html = f"""
                    <div class='result-card'>
                        <p class='section-heading'>Analysis results</p>
                        <div style='display:flex; flex-wrap:wrap; gap:0.65rem; align-items:center; margin-bottom:1rem;'>
                            <span class='badge {badge_class}'>Risk level: {risk_level}</span>
                            <span style='color:#6b7280; font-size:0.95rem;'>Probability: {phishing_score:.1%}</span>
                        </div>
                        <p style='margin:0 0 1rem 0; color:#6b7280;'>The dashboard highlights relevant phishing signals so you can quickly understand the threat.</p>
                        <div style='display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;'>
                    """
                    st.markdown(result_html, unsafe_allow_html=True)

                    for indicator in indicators:
                        st.markdown(f"<span class='tag'>{indicator}</span>", unsafe_allow_html=True)

                    details_html = """
                        </div>
                        <h3 style='font-size:1rem; margin:1rem 0 0.65rem 0; color:#111827;'>Why this message was flagged</h3>
                        <ul style='padding-left:1.2rem; color:#6b7280; line-height:1.75; margin:0;'>
                    """
                    st.markdown(details_html, unsafe_allow_html=True)

                    if indicators == ['No common red flags found']:
                        st.markdown('<li>No major red flags found in the text.</li>', unsafe_allow_html=True)
                    else:
                        for indicator in indicators:
                            st.markdown(f'<li>{indicator}</li>', unsafe_allow_html=True)

                    st.markdown("""
                        </ul>
                        <h3 style='font-size:1rem; margin:1rem 0 0.65rem 0; color:#111827;'>What to do next</h3>
                        <ul style='padding-left:1.2rem; color:#6b7280; line-height:1.75; margin:0;'>
                            <li>Do not click any links.</li>
                            <li>Do not open attachments.</li>
                            <li>Verify through the official company website.</li>
                            <li>Report the message if it looks malicious.</li>
                            <li>Delete it if confirmed malicious.</li>
                        </ul>
                    </div>
                    """, unsafe_allow_html=True)

                    st.progress(phishing_score)
                    st.caption('This tool helps identify common phishing patterns, but no detector is perfect. Always verify suspicious messages manually.')
                except Exception as e:
                    st.error('Analysis failed. Please try again.')
                    st.exception(e)

with side_col:
    st.markdown("""
    <div class='info-card'>
        <h3>What we check</h3>
        <ul>
            <li>Urgent or threatening language</li>
            <li>Suspicious links and redirects</li>
            <li>Requests for passwords, codes, or credentials</li>
            <li>Fake sender and impersonation clues</li>
            <li>High-pressure or urgency tactics</li>
        </ul>
    </div>
    <div class='info-card'>
        <h3>Common red flags</h3>
        <ul>
            <li>“Act now” or deadline pressure</li>
            <li>Account suspension claims</li>
            <li>Spelling and grammar mistakes</li>
            <li>Unknown or mismatched sender</li>
            <li>Links that do not match the company</li>
            <li>Requests for login or payment info</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)

st.markdown("<div style='text-align:center; color:#6b7280; margin-top:1.75rem;'>Built with Streamlit and scikit-learn</div>", unsafe_allow_html=True)
