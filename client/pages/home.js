export default () => (
  <div class="home">
    <style jsx>{`
      .home {
        padding: 56px 20px;
        min-height: 100%;
        width: 100%;
        flex:1;
      }
    `}</style>
    <If condition={ true }>
      <span>IfBlock</span>
    </If>
    <If condition={ false }>
      <span>IfBlock false</span>
    </If>
    <span>Home</span>
  </div>
)
