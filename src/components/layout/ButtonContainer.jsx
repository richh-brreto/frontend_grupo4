function ButtonContainer({ children }) {
    return(
        <div
            style={{
                display: 'flex', 
                alignItems: 'center', 
                gap: 16
            }}>
            {children}
        </div>
    );
}

export default ButtonContainer;